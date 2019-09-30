import {observable} from "mobx";

import {TomographyCollectionViewModel} from "./tomographyViewModel";
import {CompartmentHistoryViewModel} from "./compartmentHistoryViewModel";
import {rootDataStore} from "../system/systemDataStore";

export class SystemViewModel {
    @observable Tomography: TomographyCollectionViewModel = new TomographyCollectionViewModel(rootDataStore.Tomography);
    @observable CompartmentHistory: CompartmentHistoryViewModel = new CompartmentHistoryViewModel();
}

export const rootViewModel: SystemViewModel = new SystemViewModel();
