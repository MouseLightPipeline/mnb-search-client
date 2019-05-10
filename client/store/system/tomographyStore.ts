import {observable} from "mobx";
import {ISamplePlaneLimits, ISampleTomography} from "../../graphql/tomography";

export class SamplePlaneLimits {
    @observable public Horizontal: [number, number];
    @observable public Sagittal: [number, number];
    @observable public Coronal: [number, number];

    public static fromSource(limits: ISamplePlaneLimits) {
        const obj = new SamplePlaneLimits();

        obj.Horizontal = limits.horizontal;
        obj.Sagittal = limits.sagittal;
        obj.Coronal = limits.coronal;

        return obj;
    }
}

export class SampleTomography {
    @observable public Id: string;
    @observable public Name: string;
    @observable public Origin: [number, number, number];
    @observable public PixelSize: [number, number, number];
    @observable public Threshold: [number, number];
    @observable public Limits: SamplePlaneLimits;

    public static fromSource(tomography: ISampleTomography) {
        const obj = new SampleTomography();

        obj.Id = tomography.id;
        obj.Name = tomography.name;
        obj.Origin = tomography.origin;
        obj.PixelSize = tomography.pixelSize;
        obj.Threshold = tomography.threshold;
        obj.Limits = SamplePlaneLimits.fromSource(tomography.limits);

        return obj;
    }
}

export class TomographyStore {
    @observable public Samples: Map<string, SampleTomography> = new Map<string, SampleTomography>();

    public fromSource(tomography: ISampleTomography[]) {
        this.Samples.clear();

        tomography.map(t => this.Samples.set(t.id, SampleTomography.fromSource(t)));
    }

    public get ReferenceSample(): SampleTomography {
        return this.Samples.get("64f40090-1e7f-411e-bed1-497060dbd2be");
    }
}
