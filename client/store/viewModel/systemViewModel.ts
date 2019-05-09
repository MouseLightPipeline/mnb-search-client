import {observable} from "mobx";

import {TomographyViewModel} from "./tomographyViewModel";
import {CompartmentHistoryViewModel} from "./compartmentHistoryViewModel";

export class SystemViewModel {
    @observable Tomography: TomographyViewModel = new TomographyViewModel();
    @observable CompartmentHistory: CompartmentHistoryViewModel = new CompartmentHistoryViewModel();

    // @observable neurons: NeuronsViewModel = new NeuronsViewModel();
}

export const rootViewModel: SystemViewModel = new SystemViewModel();
