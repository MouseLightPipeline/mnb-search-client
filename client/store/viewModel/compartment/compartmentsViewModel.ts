import {action, observable, when} from "mobx";

import {CompartmentHistoryViewModel} from "./compartmentHistoryViewModel";
import {CompartmentViewModel} from "./compartmentViewModel";
import {IBrainArea} from "../../../models/brainArea";
import {NdbConstants, ROOT_ID} from "../../../models/constants";
import {CompartmentTreeViewModel} from "./compartmentTreeViewModel";

export class CompartmentsViewModel {
    /**
     * The list of all compartments that can be displayed (`geometryEnable` property) sorted by depth.
     */
    @observable public Compartments = observable.array<CompartmentViewModel>([]);

    /**
     * The list of compartments that are selected and visible in the viewer or other elements.
     */
    @observable public VisibleCompartments = observable.array<CompartmentViewModel>([]);

    /**
     * A model for a list of compartments displayed as a tree or a flat list when a filter is applied.
     */
    @observable public Tree: CompartmentTreeViewModel;

    /**
     * A history of previously selected compartments.
     */
    @observable public History: CompartmentHistoryViewModel = new CompartmentHistoryViewModel();

    private _constants: NdbConstants;

    private _compartmentMap = new Map<string, CompartmentViewModel>();

    private _rootCompartmentId: string;

    public constructor(constants: NdbConstants) {
        this._constants = constants;

        if (this._constants.IsLoaded) {
            this.initialize();
        } else {
            when(() => this._constants.IsLoaded, () => this.initialize());
        }
    }

    private initialize() {
        this._constants.BrainAreas.filter(c => c.geometryEnable).forEach(c => {
            this.createViewModel(c);
        });

        this.Compartments.replace(this.Compartments.slice().sort((a: CompartmentViewModel, b: CompartmentViewModel) => {
            if (a.compartment.depth === b.compartment.depth) {
                return a.compartment.name.toLowerCase().localeCompare(b.compartment.name.toLowerCase());
            }

            return a.compartment.depth - b.compartment.depth;
        }));

        this._rootCompartmentId = this._constants.findBrainAreaId(ROOT_ID);

        this.Tree = new CompartmentTreeViewModel(this.Compartments);

        this.History.addCompartment(this._compartmentMap.get(this._rootCompartmentId));
        this.VisibleCompartments.push(this._compartmentMap.get(this._rootCompartmentId));
    }

    @action
    public reset(): void {
        // TODO take responsibility for clearing history.
        this.VisibleCompartments.clear();
        this.VisibleCompartments.push(this._compartmentMap.get(this._rootCompartmentId));
    }

    @action
    public show(ids: number[]) {
        this.VisibleCompartments.clear();

        ids.forEach(id => {
            const viewModel = this._compartmentMap.get(this._constants.findBrainAreaId(id));

            if (!this.VisibleCompartments.includes(viewModel)) {
                this.VisibleCompartments.push();
                this.History.addCompartment(viewModel);
            }
        });
    }

    // TODO no return value
    @action
    public mutate(added: string[], removed: string[] = []) {
        removed.forEach(id => {
            const viewModel = this._compartmentMap.get(id);
            this.VisibleCompartments.remove(viewModel);
            // viewModel.isDisplayed = false;
        });

        added.forEach(id => {
            const viewModel = this._compartmentMap.get(id);

            if (!this.VisibleCompartments.includes(viewModel)) {
                // viewModel.isDisplayed = true;
                this.VisibleCompartments.push();
                this.History.addCompartment(viewModel);
            }

            return viewModel;
        });
    }

    @action
    public toggle(id: string) {
        const viewModel = this._compartmentMap.get(id);

        if (this.VisibleCompartments.includes(viewModel)) {
            // viewModel.isDisplayed = false;
            this.VisibleCompartments.remove(viewModel);
        } else {
            // viewModel.isDisplayed = true;
            this.VisibleCompartments.push(viewModel);
            this.History.addCompartment(viewModel);
        }
    }

    private createViewModel(compartment: IBrainArea): void {
        if (compartment.structureId === 9999990) {
            console.log(compartment);
        }
        if (compartment.structureId === 9999991) {
            console.log(compartment);
        }
        if (compartment.structureId === 9999992) {
            console.log(compartment);
        }

        const viewModel = new CompartmentViewModel(compartment);

        this.Compartments.push(viewModel);

        this._compartmentMap.set(compartment.id, viewModel);
    }
}
