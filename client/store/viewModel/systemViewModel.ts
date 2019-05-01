import {computed, observable} from "mobx";

import {TomographyViewModel} from "./tomographyViewModel";
import {NeuronsViewModel} from "./neuronsViewModel";

export class SystemViewModel {
    @observable tomography: TomographyViewModel = new TomographyViewModel();

    @observable neurons: NeuronsViewModel = new NeuronsViewModel();
}

export const rootViewModel: SystemViewModel = new SystemViewModel();
