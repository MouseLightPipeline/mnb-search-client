import {observable} from "mobx";
import {DockableDrawerViewModel, DrawerState} from "./DockableDrawerViewModel";
import {PreferencesManager} from "../../../util/preferencesManager";

export class AppLayoutViewModel {
    @observable public CompartmentsDrawer: DockableDrawerViewModel;

    @observable public NeuronsDrawer: DockableDrawerViewModel;

    public constructor() {
        this.CompartmentsDrawer = new DockableDrawerViewModel();
        this.CompartmentsDrawer.DrawerState = PreferencesManager.Instance.IsCompartmentListDocked ? DrawerState.Dock : DrawerState.Float;

        this.NeuronsDrawer = new DockableDrawerViewModel();
        this.NeuronsDrawer.DrawerState = PreferencesManager.Instance.IsNeuronListDocked ? DrawerState.Dock : DrawerState.Float;
    }
}
