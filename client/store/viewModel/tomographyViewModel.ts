import {action, computed, observable, observe} from 'mobx';

import {TomographyConstants, TomographyPlaneConstants} from "../../tomography/tomographyConstants";
import {ISample} from "../../models/sample";
import {SampleTomography, Threshold, TomographyCollection} from "../system/tomographyCollection";

const tomographyConstants = TomographyConstants.Instance;

const ThresholdPaddingPercentage = 0.2;

export class SliceControlViewModel {
    @observable public IsEnabled: boolean = false;
    @observable public Location: number = 0;


    public constructor(constants: TomographyPlaneConstants) {
        this.IsEnabled = false;
        this.Location = constants.Center;
    }
}

export class TomographyViewModel {
    private readonly _sampleTomography: SampleTomography = null;

    public constructor(tomography: SampleTomography) {
        this._sampleTomography = tomography;

        this.resetCustomThreshold();

        this.computePaddedLimits();
    }

    @observable public SampleIdNumber: number;

    @observable public UseCustomThreshold: boolean = false;

    @observable public CustomThreshold: Threshold = new Threshold(0, 1);

    @observable public CustomThresholdLimits: Threshold= new Threshold(0, 1);

    @computed get SampleTomography(): SampleTomography {
        return this._sampleTomography;
    }

    @computed get IsReferenceSample(): boolean {
        return this._sampleTomography.IsReferenceTomography;
    }

    @computed get IsCustomThreshold(): boolean {
        return this.UseCustomThreshold && (this.CustomThreshold.Min !== this._sampleTomography.DefaultThreshold[0] || this.CustomThreshold.Max !== this._sampleTomography.DefaultThreshold[1]);
    }

    @action
    public incrementMinThreshold(amount: number) {
        this.CustomThreshold.Min = Math.max(this.CustomThresholdLimits.Min, Math.min(this.CustomThresholdLimits.Max, this.CustomThreshold.Min + amount));
    }

    @action
    public incrementMaxThreshold(amount: number) {
        this.CustomThreshold.Max = Math.max(this.CustomThresholdLimits.Min, Math.min(this.CustomThresholdLimits.Max, this.CustomThreshold.Max + amount));
    }

    @action
    public updateCustomThreshold(value: [number, number]): void {
        this.CustomThreshold.Min = value[0];
        this.CustomThreshold.Max = value[1];
    }

    @action
    public resetCustomThreshold() {
        this.CustomThreshold.Min = this._sampleTomography.DefaultThreshold.Min;
        this.CustomThreshold.Max = this._sampleTomography.DefaultThreshold.Max;
    }

    private computePaddedLimits() {
        const threshold = [this.CustomThreshold.Min, this.CustomThreshold.Max];

        const padding = Math.floor((threshold[1] - threshold[0]) * ThresholdPaddingPercentage);

        this.CustomThresholdLimits.Min = Math.max(0, threshold[0] - padding);
        this.CustomThresholdLimits.Max = Math.min(16384, threshold[1] + padding);
    }
}

export class TomographyCollectionViewModel {
    @observable private readonly _tomographyDataStore: TomographyCollection;

    private _viewModels: Map<string, TomographyViewModel> = new Map<string, TomographyViewModel>();

    private _lastTomography: TomographyViewModel = null;

    @observable private _selection: TomographyViewModel = null;

    public constructor(tomographyDataStore: TomographyCollection) {
        this._tomographyDataStore = tomographyDataStore;

        // Tomography will most likely not have been loaded when this view model is created.
        observe(tomographyDataStore, () => {
            if (this._refTomography == null && tomographyDataStore.ReferenceTomography != null) {
                this._selection = this.ReferenceSampleTomography;
            }
        })
    }

    @observable public AreControlsVisible: boolean = true;

    @observable public Sagittal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Sagittal);
    @observable public Horizontal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Horizontal);
    @observable public Coronal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Coronal);

    @computed
    public get title(): string {
        return this.Selection != null ? this.Selection.IsReferenceSample ? "Reference" : `Sample ${this.Selection.SampleIdNumber}` : "No Selection";
    }

    @computed get SelectedId(): string | null {
        return this._selection != null ? this._selection.SampleTomography.Id : null;
    }

    @computed
    public get Selection(): TomographyViewModel {
        return this._selection;
    };

    @computed get CanSwapSample(): boolean {
        return this.Selection !== null && (this.Selection !== this._refTomography || this._lastTomography !== null);
    }

    @observable private _refTomography: TomographyViewModel;

    @computed get ReferenceSampleTomography(): TomographyViewModel | null {

        if (this._refTomography == null && this._tomographyDataStore.ReferenceTomography != null) {
            this._refTomography = new TomographyViewModel(this._tomographyDataStore.ReferenceTomography);
        }

        return this._refTomography;
    }

    @action
    public setSample(sample: ISample) {
        if (this._viewModels.has(sample.id)) {
            this._selection = this._viewModels.get(sample.id);
        } else if (this._tomographyDataStore.SampleTomographyMap.has(sample.id)) {
            this._selection = new TomographyViewModel(this._tomographyDataStore.SampleTomographyMap.get(sample.id));
            this._viewModels.set(sample.id, this._selection);
        } else {
            this._selection = this._refTomography; // May or may not exist at this time.
        }

        if (this._selection && this._selection !== this._refTomography) {
            this._selection.SampleIdNumber = sample.idNumber;
        }
    }

    @action
    public swapSample() {
        if (this.Selection && this.Selection.IsReferenceSample) {
            this._selection = this._lastTomography;
            this._lastTomography = null;
        } else {
            this._lastTomography = this._selection;
            this._selection = this._refTomography;
        }
    }
}
