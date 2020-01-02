import {action, observable} from "mobx";
import {CompartmentViewModel} from "./compartmentViewModel";

// TODO Option to limit to N most recent compartments.  Option to reset list.

export class CompartmentHistoryViewModel {
    // TODO this should be in a viewmodel for the overall state of the components not in the history itself.
    @observable public IsVisible: boolean = true;

    @observable public Compartments = observable.array<CompartmentViewModel>([]);

    @action
    public addCompartment(v: CompartmentViewModel) {
        if (!this.Compartments.includes(v)) {
            this.Compartments.push(v);
        }
    }

    @action
    public removeCompartment(v: CompartmentViewModel) {
        this.Compartments.remove(v);
    }
}
