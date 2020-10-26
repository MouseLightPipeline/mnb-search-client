import {NeuronViewModel} from "./neuronViewModel";
import {ITracing} from "../models/tracing";
import {ITracingNode} from "../models/tracingNode";
import {ITracingStructure, TracingStructure} from "../models/tracingStructure";
import {computed, observable} from "mobx";

export class TracingViewModel {
    /**
     * For axon or dendrite tracings, id reflects the underlying tracing id.  For the soma-only tracing store by the
     * neuron view model for convenience, id is the neuron id.
     */
    id: string;
    tracing: ITracing;
    structure: ITracingStructure;
    @observable private readonly _neuron: NeuronViewModel;
    soma: ITracingNode;
    // isHighlighted: boolean;
    nodeLookup: Map<number, ITracingNode>;

    public constructor(id: string, neuron: NeuronViewModel) {
        this._neuron = neuron;

        this.id = id;
        this.tracing = null;
        this.structure = null;
        this.soma = null;
        // this.isHighlighted = null;
        this.nodeLookup = null;
    }

    public get neuron() {
        return this._neuron;
    }

    public get NeuronId() {
        return this._neuron.Id;
    }

    @computed
    public get IsSomaOnly(): boolean {
        return this._neuron.CurrentViewMode.structure === TracingStructure.soma;
    }

    @computed
    public get IsHighlighted(): boolean {
        return this._neuron.isInHighlightList && (this._neuron.CurrentViewMode.structure === TracingStructure.all || this._neuron.CurrentViewMode.structure === this.structure.value);
    }
}
