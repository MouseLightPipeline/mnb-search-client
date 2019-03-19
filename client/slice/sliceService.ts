export enum SlicePlane {
    Undefined,
    Sagittal,
    Horizontal,
    Coronal
}

export type Threshold = [number, number];

export interface ISliceRequest {
    id?: string;
    plane?: number;
    location?: number;
    threshold?: [number, number];
    mask?: boolean;
    invert?: boolean;
}

export type SliceImage = {
    image: HTMLImageElement;
    mask: HTMLImageElement;
}

export class SliceService {
    private readonly _sampleId: string;

    private _threshHold: Threshold = undefined;

    public constructor(sampleId: string) {
        this._sampleId = sampleId;
    }

    public async requestSlice(request: ISliceRequest): Promise<SliceImage> {
        const resp = await fetch("/slice", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(Object.assign({id: this._sampleId, threshold: this._threshHold}, request))
        });

        if (resp.status !== 200) {
            return null;
        }

        const json = await resp.json();

        const image = new Image();
        image.src = 'data:image/png;base64,' + json.texture;

        const mask = new Image();
        mask.src = 'data:image/png;base64,' + json.mask;

        return {
            image,
            mask
        }
    }
}