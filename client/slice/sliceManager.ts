export enum SlicePlane {
    Coronal,
    Horizontal,
    Sagittal
}

export type Coordinates = [number, number, number];

export type Threshold = [number, number];

export interface ISliceRequestBody {
    sampleId?: string;
    plane?: SlicePlane;
    coordinates?: Coordinates;
    threshold?: Threshold;

}

export async function requestSlice(request: ISliceRequestBody): Promise<HTMLImageElement[]> {
    const resp = await fetch("/slice", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(request)
    });

    if (resp.status !== 200) {
        return null;
    }

    const json = await resp.json();

    const textureImage = new Image();
    textureImage.src = 'data:image/png;base64,' + json.texture;

    const maskImage = new Image();
    maskImage.src = 'data:image/png;base64,' + json.mask;

    return [textureImage, maskImage];
}
