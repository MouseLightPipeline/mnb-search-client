import {observable} from 'mobx';

import {TomographyConstants, TomographyPlaneConstants} from "../../tomography/tomographyConstants";
import {ISample} from "../../models/sample";
import {Threshold} from "../../services/sliceService";

const tomographyConstants = TomographyConstants.Instance;

export class SliceControlViewModel {
    @observable public IsEnabled: boolean = false;
    @observable public Location: number = 0;

    public constructor(constants: TomographyPlaneConstants) {
        this.IsEnabled = false;
        this.Location = constants.Center;
    }
}

export class ThresholdViewModel {
    @observable public UseCustom: boolean = false;
    @observable public Current: Threshold = [0, 16384];
    @observable public CurrentSampleBounds: Threshold = [0, 16384];
}

export class TomographyViewModel {
    @observable public IsVisible: boolean = true;

    @observable public Sample: ISample = null;

    @observable public Threshold: ThresholdViewModel = new ThresholdViewModel();

    @observable public Sagittal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Sagittal);
    @observable public Horizontal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Horizontal);
    @observable public Coronal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Coronal);
}
