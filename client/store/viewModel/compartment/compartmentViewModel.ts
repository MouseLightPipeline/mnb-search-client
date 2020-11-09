import {observable} from "mobx";

import {IBrainArea} from "../../../models/brainArea";

export class CompartmentViewModel {
    @observable public compartment: IBrainArea;
    @observable public isFavorite: boolean;

    // TODO remove
    // @observable public isDisplayed: boolean;

    public constructor(neuron: IBrainArea) {
        this.compartment = neuron;
        // this.isDisplayed = false;
        this.isFavorite = false;
    }
}
