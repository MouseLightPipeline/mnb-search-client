import {observable} from 'mobx';

import {TomographyConstants, TomographyPlaneConstants} from "../../tomography/tomographyConstants";

const tomographyConstants = TomographyConstants.Instance;

export class SliceControlViewModel {
    @observable public IsEnabled: boolean = false;
    @observable public Location: number = 0;

    public constructor(constants: TomographyPlaneConstants) {
        this.IsEnabled = false;
        this.Location = constants.Center;
    }
}

export class TomographyViewModel {
    @observable public Sagittal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Sagittal);
    @observable public Horizontal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Horizontal);
    @observable public Coronal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Coronal);
}
