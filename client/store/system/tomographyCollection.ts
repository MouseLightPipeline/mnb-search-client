import {action, computed, observable} from "mobx";

import {ISamplePlaneLimits, ISampleTomography} from "../../graphql/tomography";

export type Point3D = [number, number, number];
export type Range2D = [number, number];

const ReferenceTomographyId = "64f40090-1e7f-411e-bed1-497060dbd2be";

export class TomographyPlaneLimits {
    @observable public readonly Horizontal: Range2D;
    @observable public readonly Sagittal: Range2D;
    @observable public readonly Coronal: Range2D;

    public constructor(limits: ISamplePlaneLimits) {
        this.Horizontal = limits.horizontal;
        this.Sagittal = limits.sagittal;
        this.Coronal = limits.coronal;
    }

    @action
    public static fromSource(limits: ISamplePlaneLimits) {
        return new TomographyPlaneLimits(limits);
    }
}

export class Threshold {
    @observable public Min = 0;
    @observable public Max = 1;

    public constructor(min: number, max: number) {
        this.Min = min;
        this.Max = max;
    }

    @computed
    public get Values(): [number, number] {
        return [this.Min.valueOf(), this.Max.valueOf()];
    }
}

export class SampleTomography {
    @observable public Id: string;
    @observable public Name: string;
    @observable public Origin: Point3D;
    @observable public PixelSize: Point3D;
    @observable public DefaultThreshold: Threshold;
    @observable public Limits: TomographyPlaneLimits;

    @observable public readonly IsReferenceTomography: boolean;

    private constructor(tomography: ISampleTomography) {
        this.Id = tomography.id;
        this.Name = tomography.name;
        this.Origin = tomography.origin;
        this.PixelSize = tomography.pixelSize;
        this.DefaultThreshold = new Threshold(...tomography.threshold);
        this.Limits = TomographyPlaneLimits.fromSource(tomography.limits);

        this.IsReferenceTomography = this.Id === ReferenceTomographyId;
    }

    @action
    public static fromSource(tomography: ISampleTomography) {
        return new SampleTomography(tomography);
    }
}

export class TomographyCollection {
    @observable public SampleTomographyMap: Map<string, SampleTomography> = new Map<string, SampleTomography>();

    @observable public count: number;

    @action
    public fromSource(tomography: ISampleTomography[]) {
        this.SampleTomographyMap.clear();

        tomography.map(t => this.SampleTomographyMap.set(t.id, SampleTomography.fromSource(t)));

        this.count = this.SampleTomographyMap.size;
    }

    @computed
    public get ReferenceTomography(): SampleTomography | null {
        return this.SampleTomographyMap.get(ReferenceTomographyId) || null;
    }
}
