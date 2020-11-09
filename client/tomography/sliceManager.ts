import {Scene} from "three";

import {SlicePlane, SliceService} from "../services/sliceService";
import {Slice} from "./slice";
import {TomographyConstants} from "./tomographyConstants";
import {Point3D, Range2D} from "../util/viewerTypes";

const tomographyConstants = TomographyConstants.Instance;

const centerPoint: Point3D = [tomographyConstants.Sagittal.Center, tomographyConstants.Horizontal.Center, tomographyConstants.Coronal.Center];

export class SliceManager {
    private _sampleId: string = null;

    private _threshold: Range2D = null;

    private _sliceService: SliceService;

    private _scene: Scene;

    private _sliceMap = new Map<SlicePlane, Slice>();

    public constructor(scene?: Scene) {
        this.setScene(scene);

        this.initializeSliceService();
    }

    public get Scene(): Scene {
        return this._scene;
    }

    public async setSampleId(id: string, locations: Point3D) {
        if (id !== this._sampleId) {
            this._sampleId = id;

            await this.updateSlice(SlicePlane.Sagittal, locations[0]);
            await this.updateSlice(SlicePlane.Horizontal, locations[1]);
            await this.updateSlice(SlicePlane.Coronal, locations[2]);
        }
    }

    public async setThreshold(threshold: Range2D, locations: Point3D) {
        this._threshold = threshold;

        await this.updateSlice(SlicePlane.Sagittal, locations[0]);
        await this.updateSlice(SlicePlane.Horizontal, locations[1]);
        await this.updateSlice(SlicePlane.Coronal, locations[2]);
    }

    private setScene(scene: Scene) {
        if (this._scene !== null) {
            // TODO Cleanup existing geometry.
        }

        this._scene = scene;
    }

    private initializeSliceService() {
        this._sliceService = new SliceService();
    }

    public async updateSlice(plane: SlicePlane, location: number) {
        let slice = this._sliceMap.get(plane);

        if (slice != null && this._sampleId != null) {
            const images = await this._sliceService.requestSlice({
                id: this._sampleId,
                plane,
                threshold: this._threshold,
                location: location === null ? slice.Location : location
            });

            if (images !== null) {
                if (images.sampleId === this._sampleId) {
                    slice.Mesh.visible = true;
                    slice.updateTextureAndLocation(location, images);
                }
            } else {
                slice.Mesh.visible = false;
            }
        }
    }

    public showSlice(plane: SlicePlane): Slice {
        let slice = this._sliceMap.get(plane);

        if (slice === undefined) {
            slice = new Slice(plane);

            this._sliceMap.set(plane, slice);

            this.updateSlice(plane, centerPoint[plane - 1]).then();
        }

        slice.Mesh.visible = true;

        this._scene.add(slice.Mesh);

        return slice;
    }

    public hideSlice(plane: SlicePlane) {
        if (!this._sliceMap.has(plane)) {
            return;
        }

        this._scene.remove(this._sliceMap.get(plane).Mesh);
    }
}
