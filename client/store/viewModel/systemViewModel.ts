import {observable} from "mobx";

import { SystemDataStore} from "../system/systemDataStore";
import {TomographyViewModel} from "./tomographyViewModel";
import {ViewerViewModel} from "./viewerViewModel";
import {CompartmentsViewModel} from "./compartment/compartmentsViewModel";
import {AppLayoutViewModel} from "./layout/AppLayoutViewModel";

export class SystemViewModel {
    @observable Layout: AppLayoutViewModel = new AppLayoutViewModel();

    @observable Tomography: TomographyViewModel;

    @observable Viewer: ViewerViewModel;

    @observable Compartments: CompartmentsViewModel;

    public constructor(dataStore: SystemDataStore) {
        this.Tomography = new TomographyViewModel(dataStore.Tomography);

        this.Compartments = new CompartmentsViewModel(dataStore.Constants);

        this.Viewer = new ViewerViewModel(this.Tomography, this.Compartments);
    }
}

// TODO remove

/**
 * @deprecated("avoid using, will be removed")
 */
export let rootViewModel: SystemViewModel;

/**
 * @deprecated("avoid using, will be removed")
 */
export function setRootViewModel(viewModel: SystemViewModel) {
    rootViewModel = viewModel;
}
