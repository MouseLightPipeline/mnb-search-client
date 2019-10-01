import {observable} from "mobx";

import {TomographyViewModel} from "./tomographyViewModel";
import {CompartmentHistoryViewModel} from "./compartmentHistoryViewModel";
import {rootDataStore} from "../system/systemDataStore";

export class SystemViewModel {
    @observable Tomography: TomographyViewModel = new TomographyViewModel(rootDataStore.Tomography);

    // Currently only used for collapse/expand of the history panel itself.
    @observable CompartmentHistory: CompartmentHistoryViewModel = new CompartmentHistoryViewModel();
}

export const rootViewModel: SystemViewModel = new SystemViewModel();
