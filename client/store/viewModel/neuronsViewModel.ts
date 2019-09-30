import {computed, observable} from "mobx";

import {NeuronViewModel} from "../../viewmodel/neuronViewModel";

export class NeuronsViewModel {
    @observable public SelectedNeuron: NeuronViewModel | null = null;
}
