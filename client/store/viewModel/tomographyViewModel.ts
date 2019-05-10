import {observable} from 'mobx';

import {TomographyConstants, TomographyPlaneConstants} from "../../tomography/tomographyConstants";
import {ISample} from "../../models/sample";

const tomographyConstants = TomographyConstants.Instance;

const padding = Math.floor((300 - 35) * 0.2);

export class Threshold {
    @observable public Min = 0;
    @observable public Max = 1;

    public constructor(min, max) {
        this.Min = min;
        this.Max = max;
    }

    public get Values(): [number, number] {
        return [this.Min.valueOf(), this.Max.valueOf()];
    }
}

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
    @observable public Current: Threshold = new Threshold(35, 300);
    @observable public CurrentSampleBounds: Threshold = new Threshold(Math.max(0, 35 - padding), Math.min(16384, 300 + padding));

    public ActualMin = 35;
    public ActualMax = 300;
}

export class TomographyViewModel {
    @observable public IsVisible: boolean = true;

    @observable public Sample: ISample = null;

    @observable public Threshold: ThresholdViewModel = new ThresholdViewModel();

    @observable public Sagittal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Sagittal);
    @observable public Horizontal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Horizontal);
    @observable public Coronal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Coronal);
}
