import * as React from "react";
import {observer} from "mobx-react-lite";

import {useStore, useViewModel} from "../../../app/App";
import {NeuronViewModel} from "../../../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODES, NeuronViewMode} from "../../../../viewmodel/neuronViewMode";
import {Dropdown, Icon, List, MenuItem, Popup} from "semantic-ui-react";
import {TracingStructure} from "../../../../models/tracingStructure";
import {HighlightSelectionMode} from "../../TracingViewer";

type SelectedTracingProps = {
    viewModel: NeuronViewModel;

    onToggleTracing(id: string): void;
    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

export const SelectedTracingRow = observer((props: SelectedTracingProps) => {
    const {Viewer, Compartments} = useViewModel();
    const {Constants} = useStore();

    const neuron = props.viewModel;

    const isSelected = Viewer.highlightSelectionMode === HighlightSelectionMode.Cycle && neuron.Id === Viewer.cycleFocusNeuronId;

    const viewMode = neuron.CurrentViewMode.structure;

    const soma = neuron.somaOnlyTracing.soma;

    let somaBrainAreaLabel = null;

    if (soma) {
        const somaBrainArea = Constants.findBrainArea(soma.brainAreaId);

        if (somaBrainArea) {
            let somaDisplayBrainArea = somaBrainArea;

            while (!somaDisplayBrainArea.geometryEnable) {
                somaDisplayBrainArea = Constants.findBrainArea(somaDisplayBrainArea.parentStructureId);
            }

            const somaBrainAreaTrigger = <a onClick={() => Compartments.toggle(somaBrainArea.id)}>
                {` ${somaBrainArea.acronym}`}
            </a>;

            somaBrainAreaLabel = (
                <Popup trigger={somaBrainAreaTrigger}
                       style={{maxHeight: "30px"}}>{somaDisplayBrainArea.name}</Popup>
            );
        }
    }

    let structureLabel = " - (soma only)";

    // If not highlighted is the proxy tracing for showing just the soma.
    if (viewMode !== TracingStructure.soma) {
        structureLabel = "";
    }

    const options = NEURON_VIEW_MODES.slice();

    if (!neuron.hasDendriteTracing) {
        options.splice(2, 1);
    }

    if (!neuron.hasAxonTracing) {
        options.splice(1, 1);
    }

    if (options.length < 4) {
        options.splice(0, 1);
    }

    const menus = options.map(o => {
        return (<MenuItem key={o.id} onClick={() => props.onChangeNeuronViewMode(neuron, o)}>{o.id}</MenuItem>);
    });

    return (
        <List.Item active={isSelected}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <div style={{flex: "1 1 auto", order: 1, fontWeight: isSelected ? "bold" : "normal"}} onClick={() => Viewer.onSetHighlightedNeuron(neuron)}>
                    {`${neuron.neuron.idString}${structureLabel} `}
                </div>

                {neuron.RequestedViewMode === null ? <Dropdown options={menus} trigger={neuron.CurrentViewMode.id} style={{
                        flex: "0 0 auto",
                        order: 2,
                        width: "80px",
                        textAlign: "left"
                    }}/>
                    : <div style={{flex: "0 0 auto", order: 2, width: "80px"}}>Loading...</div>}
                <div style={{flex: "0 0 auto", order: 3, paddingRight: "10px"}}>
                    {somaBrainAreaLabel}
                </div>
                <Icon name="remove" className="pull-right"
                      style={{flex: "0 0 auto", order: 4, marginBottom: "4px"}}
                      onClick={() => Viewer.onChangeHighlightTracing(neuron, false)}/>
            </div>
        </List.Item>
    )
});
