import {observable} from "mobx";

import {TomographyViewModel} from "./tomographyViewModel";

export class SystemViewModel {
    @observable tomography: TomographyViewModel = new TomographyViewModel();
}

export const rootViewModel: SystemViewModel = new SystemViewModel();
