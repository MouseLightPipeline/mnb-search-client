export enum SlicePlane {
    Undefined = 0,
    Sagittal,
    Horizontal,
    Coronal
}

export type Threshold = [number, number];

export interface ISliceRequest {
    id?: string;
    plane?: number;
    location?: number;
    threshold?: Threshold;
    mask?: boolean;
    invert?: boolean;
}

export type SliceImage = {
    sampleId: string;
    image: HTMLImageElement;
    mask: HTMLImageElement;
}

export class SliceService {
    public async requestSlice(request: ISliceRequest): Promise<SliceImage | null> {
        const resp = await fetch("/slice", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(Object.assign({id: "allen-reference"}, request))
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
            sampleId: request.id === "allen-reference" ? null : request.id,
            image,
            mask
        }
    }
}