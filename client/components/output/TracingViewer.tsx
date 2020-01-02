import * as React from "react";
import {observer} from "mobx-react";
import * as _ from "lodash";
import Color = require("color");

import {ITracingNode} from "../../models/tracingNode";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {NdbConstants} from "../../models/constants";
import {IPositionInput} from "../../models/queryFilter";
import {ViewerSelection} from "./ViewerSelection";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {TracingStructure} from "../../models/tracingStructure";
import {PreferencesManager} from "../../util/preferencesManager";
import {rootViewModel} from "../../store/viewModel/systemViewModel";

export enum HighlightSelectionMode {
    Normal,
    Cycle
}

export interface ITiming {
    total: number;
    load: number;
    map: number;
    transfer: number;
}

export interface ITracingViewerBaseProps {
    constants: NdbConstants;
    tracings: TracingViewModel[];
    activeNeurons: NeuronViewModel[];
    isLoading: boolean;
    isRendering: boolean;
    fixedAspectRatio?: number;
    displayHighlightedOnly: boolean;
    highlightSelectionMode: HighlightSelectionMode;
    cycleFocusNeuronId: string;
    selectedTracing: TracingViewModel;
    selectedNode: ITracingNode;

    onChangeIsRendering?(isRendering: boolean): void;
    onSelectNode?(tracing: TracingViewModel, node: ITracingNode): void;
    onToggleTracing(id: string): void;
    populateCustomPredicate(position: IPositionInput, replace: boolean): void;
    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

@observer
export class TracingViewer extends React.Component<ITracingViewerBaseProps, {}> {
    private _loadedNeurons: string[] = [];
    private _knownNeurons = new Set<string>();

    private _neuronColors = new Map<string, string>();

    private _tracingRadiusFactor = PreferencesManager.Instance.TracingRadiusFactor;

    public async componentDidMount() {

        this.prepareAndRenderTracings(this.props);
    }

    public componentWillReceiveProps(props: ITracingViewerBaseProps) {
        this.prepareAndRenderTracings(props);
    }

    private createNeuron(tracing: TracingViewModel, fadedOpacity: number) {
        const nodes: any = {};

        if (tracing.IsSomaOnly) {
            const node = tracing.soma;

            // Can happen before data is loaded.
            if (!node) {
                return;
            }

            nodes[node.sampleNumber] = {
                alpha: 1.0,
                sampleNumber: node.sampleNumber,
                type: 0,
                x: node.x,
                y: node.y,
                z: node.z,
                radius: Math.min(40, node.radius * 40) * this._tracingRadiusFactor,
                parent: node.parentNumber
            };
        } else {
            // Can happen during transition from soma view mode to tracing, before data is loaded.
            if (!tracing.tracing) {
                return;
            }

            let mapNodes = false;

            if (!tracing.nodeLookup) {
                tracing.nodeLookup = new Map<number, ITracingNode>();
                mapNodes = true;
            }

            tracing.tracing.nodes.forEach(node => {
                if (node) {
                    nodes[node.sampleNumber] = {
                        sampleNumber: node.sampleNumber,
                        type: 0,
                        x: node.x,
                        y: node.y,
                        z: node.z,
                        radius: 4 * this._tracingRadiusFactor,
                        parent: node.parentNumber
                    };

                    if (mapNodes) {
                        tracing.nodeLookup.set(node.sampleNumber, node);
                    }
                }
            });
        }

        this._neuronColors.set(tracing.id, tracing.neuron.baseColor);

        let color = Color(tracing.neuron.baseColor);

        if (tracing.structure.value === TracingStructure.dendrite) {
            color = color.darken(0.75);
        }

        rootViewModel.Viewer.viewer.loadNeuron(tracing.id, color.hex(), nodes);

        this.setOpacity(tracing, fadedOpacity);

        this._knownNeurons.add(tracing.id);
    }

    private verifyNeuron(tracing: TracingViewModel, fadedOpacity: number) {
        const matches = this._neuronColors.get(tracing.id) === tracing.neuron.baseColor;

        if (matches) {
            this.setOpacity(tracing, fadedOpacity);
            rootViewModel.Viewer.viewer.setNeuronMirror(tracing.id, tracing.neuron.mirror);
        } else {
            rootViewModel.Viewer.viewer.unloadNeuron(tracing.id);
            this._knownNeurons.delete(tracing.id);
            this.createNeuron(tracing, fadedOpacity);
        }

        return matches;
    }

    private setOpacity(tracing: TracingViewModel, fadedOpacity: number) {
        if (this.props.highlightSelectionMode === HighlightSelectionMode.Normal) {
            rootViewModel.Viewer.viewer.setNeuronDisplayLevel(tracing.id, !this.props.displayHighlightedOnly || tracing.IsHighlighted ? 1.0 : fadedOpacity);
        } else {
            if (tracing.NeuronId === this.props.cycleFocusNeuronId) {
                rootViewModel.Viewer.viewer.setNeuronDisplayLevel(tracing.id, 1.0);
            } else {
                rootViewModel.Viewer.viewer.setNeuronDisplayLevel(tracing.id, tracing.IsHighlighted ? 0.1 : fadedOpacity);
            }
        }
    }

    private renderNeurons(tracings: TracingViewModel[]) {
        if (tracings === null || rootViewModel.Viewer.viewer === null) {
            return; // AppLoading, not ready, etc.  Don't change current appearance.
        }

        if (tracings.length === 0) {
            this._loadedNeurons.map(id => {
                rootViewModel.Viewer.viewer.setNeuronVisible(id, false);
            });
            this._loadedNeurons = [];

            return;
        }

        const highlightValue = PreferencesManager.Instance.TracingSelectionHiddenOpacity;

        const knownAsArray = Array.from(this._knownNeurons);

        // On screen, but should not be.
        const toHide = _.differenceWith(this._loadedNeurons, tracings, (id, tracing) => id === tracing.id);

        // Never seen and must create and show
        const toCreate = _.differenceWith(tracings, knownAsArray, (tracing, id) => id === tracing.id);

        // Known, but may have changed.
        const toVerify = _.intersectionWith(tracings, knownAsArray, (tracing, id) => id === tracing.id);

        toVerify.map(obj => {
            this.verifyNeuron(obj, highlightValue);
        });

        toCreate.map(obj => {
            this.createNeuron(obj, highlightValue);
        });

        toHide.map(id => {
            rootViewModel.Viewer.viewer.setNeuronVisible(id, false);
        });

        this._loadedNeurons = tracings.map(t => t.id);
    }

    private prepareAndRenderTracings(props: ITracingViewerBaseProps) {
        if (!this.props.isRendering) {
            this.props.onChangeIsRendering(true);
        }

        // Allows the above change in props to be reflected in the UI before performing render.
        setTimeout(() => this.loadTracings(props), 0.01);
    }

    private async loadTracings(props: ITracingViewerBaseProps) {
        this.renderNeurons(props.tracings);

        this.props.onChangeIsRendering(false);
    }

    public render() {
        const style = Object.assign({
            height: "100%",
            width: "100%",
            position: relative
        }, PreferencesManager.Instance.HideCursorInViewer ? {cursor: "none"} : {});

        return (
            <div id="viewer-parent" style={style}>
                <ViewerSelection constants={this.props.constants}
                                 selectedNode={this.props.selectedNode}
                                 selectedTracing={this.props.selectedTracing}
                                 displayHighlightedOnly={this.props.displayHighlightedOnly}
                                 highlightSelectionMode={this.props.highlightSelectionMode}
                                 cycleFocusNeuronId={this.props.cycleFocusNeuronId}
                                 activeNeurons={this.props.activeNeurons}
                                 onChangeNeuronViewMode={this.props.onChangeNeuronViewMode}
                                 onToggleTracing={this.props.onToggleTracing}
                                 populateCustomPredicate={this.props.populateCustomPredicate}/>
                <div id="viewer-container"/>
            </div>
        );
    }
}

const relative: "relative" = "relative";
