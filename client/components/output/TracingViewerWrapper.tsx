import * as React from "react";
import {useCallback, useEffect, useLayoutEffect} from "react";
import {observer} from "mobx-react-lite";

import {TracingViewer} from "./TracingViewer";
import {usePreferences} from "../../hooks/usePreferences";
import {PreferencesManager} from "../../util/preferencesManager";
import {NdbConstants} from "../../models/constants";
import {CompartmentViewModel} from "../../store/viewModel/compartment/compartmentViewModel";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {IPositionInput} from "../../models/queryFilter";
import {NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {useViewModel} from "../app/App";

export type TracingWrapperProps = {
    constants: NdbConstants;
    // compartments: CompartmentViewModel[];
    // tracings: TracingViewModel[];
    isLoading: boolean;
    isRendering: boolean;
    fixedAspectRatio?: number;
    // displayHighlightedOnly: boolean;
    // highlightSelectionMode: HighlightSelectionMode;
    // cycleFocusNeuronId: string;

    onChangeIsRendering?(isRendering: boolean): void;
    // onHighlightTracing(neuron: NeuronViewModel, highlight?: boolean): void;
    // onSelectNode?(tracing: TracingViewModel, node: ITracingNode): void;
    onToggleTracing(id: string): void;
    // onToggleCompartment(id: string): void;
    // onToggleDisplayHighlighted(): void;
    // onChangeHighlightMode(): void;
    // onSetHighlightedNeuron(neuron: NeuronViewModel): void;
    // onCycleHighlightNeuron(direction: number): void;
    populateCustomPredicate(position: IPositionInput, replace: boolean): void;
    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

export const TracingViewerWrapper = observer((props: TracingWrapperProps) => {
    const ViewModel = useViewModel();

    const onUpdateDimensions = useCallback(() => {
        const {width, height} = calculateDimensions(props.fixedAspectRatio);

        ViewModel.Viewer.viewer?.setSize(width, height);

        return {width, height};

    }, ["fixedAspectRatio"]);

    usePreferences((name) => {
        if (name === "viewerBackgroundColor") {
            ViewModel.Viewer.viewer?.setBackground(parseInt(PreferencesManager.Instance.ViewerBackgroundColor.slice(1), 16));
        }
    });

    useLayoutEffect(() => {
        const {width, height} = onUpdateDimensions();

        if (!ViewModel.Viewer.IsAttached) {
            ViewModel.Viewer.attach("viewer-container", width, height).then();
            // rootViewModel.Viewer.viewer.OnSelectNode = (tracingId: string, sampleNumber: number, event) => this.onSelectNode(tracingId, sampleNumber, event);
            // rootViewModel.Viewer.viewer.OnToggleNode = (tracingId: string) => props.onToggleTracing(tracingId);
        }
    }, []);

    useEffect(() => {
        onUpdateDimensions();

        window.addEventListener("resize", onUpdateDimensions);

        return () => {
            window.removeEventListener("resize", onUpdateDimensions);
        }
    }, []);

    return (<TracingViewer {...props}
                           activeNeurons={ViewModel.Viewer.selectedNeurons}
                           tracings={ViewModel.Viewer.Tracings}
                           selectedNode={ViewModel.Viewer.SelectedNode}
                           selectedTracing={ViewModel.Viewer.SelectedTracing}
                           displayHighlightedOnly={ViewModel.Viewer.displayHighlightedOnly}
                           highlightSelectionMode={ViewModel.Viewer.highlightSelectionMode}
                           cycleFocusNeuronId={ViewModel.Viewer.cycleFocusNeuronId}
                           onChangeNeuronViewMode={props.onChangeNeuronViewMode}/>)
});

function calculateDimensions(fixedAspectRatio: number) {
    const container = document.getElementById("viewer-parent");

    if (!container) {
        return {width: 0, height: 0};
    }

    let width = container.clientWidth;
    let height = container.clientHeight;

    if (fixedAspectRatio) {
        width = Math.min(width, height * fixedAspectRatio);

        const aspectRatio = width / height;

        if (aspectRatio > fixedAspectRatio) {
            // constrained by height
            width = fixedAspectRatio * height;
        } else {
            // constrained by width
            height = width / fixedAspectRatio;
        }
    }

    return {width, height};
}
