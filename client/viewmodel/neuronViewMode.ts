import {TracingStructure} from "../models/tracingStructure";

export class NeuronViewMode {
    id: string;
    structure: TracingStructure;

    public constructor(id: string, viewMode: TracingStructure)  {
        this.id = id;
        this.structure = viewMode;
    }
}

export let NEURON_VIEW_MODE_ALL: NeuronViewMode = null;
export let NEURON_VIEW_MODE_AXON: NeuronViewMode = null;
export let NEURON_VIEW_MODE_DENDRITE: NeuronViewMode = null;
export let NEURON_VIEW_MODE_SOMA: NeuronViewMode = null;

export const NEURON_VIEW_MODES: NeuronViewMode[] = makeTracingViewModes();

function makeTracingViewModes(): NeuronViewMode[] {

    const modes: NeuronViewMode[] = [];

    NEURON_VIEW_MODE_ALL = new NeuronViewMode("All", TracingStructure.all);
    modes.push(NEURON_VIEW_MODE_ALL);

    NEURON_VIEW_MODE_AXON = new NeuronViewMode("Axon", TracingStructure.axon);
    modes.push(NEURON_VIEW_MODE_AXON);

    NEURON_VIEW_MODE_DENDRITE = new NeuronViewMode("Dendrite", TracingStructure.dendrite);
    modes.push(NEURON_VIEW_MODE_DENDRITE);

    NEURON_VIEW_MODE_SOMA = new NeuronViewMode("Soma", TracingStructure.soma);
    modes.push(NEURON_VIEW_MODE_SOMA);

    return modes;
}
