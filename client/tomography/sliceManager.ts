import * as THREE from "three";

import {SlicePlane, SliceService} from "../services/sliceService";
import {Slice} from "./slice";
import {TomographyConstants} from "./tomographyConstants";

const tomographyConstants = TomographyConstants.Instance;

const centerPoint = [tomographyConstants.Sagittal.Center, tomographyConstants.Horizontal.Center, tomographyConstants.Coronal.Center];

export class SliceManager {
    private readonly _sampleId: string;

    private _sliceService: SliceService;

    private _scene: THREE.Scene;

    private _sliceMap = new Map<SlicePlane, Slice>();

    public constructor(sampleId: string, scene?: THREE.Scene) {
        this._sampleId = sampleId;

        this.setScene(scene);

        this.initializeSliceService();
    }

    public get Scene(): THREE.Scene {
        return this._scene;
    }

    private setScene(scene: THREE.Scene) {
        if (this._scene !== null) {
            // TODO Cleanup existing geometry.
        }

        this._scene = scene;
    }

    private initializeSliceService() {
        this._sliceService = new SliceService(this._sampleId);
    }

    public async updateSlice(plane: SlicePlane, location: number) {
        let slice = this._sliceMap.get(plane);

        if (slice !== undefined) {
            const images = await this._sliceService.requestSlice({
                plane,
                location
            });

            if (images !== null) {
                slice.Mesh.visible = true;
                slice.updateTexture(location, images);
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
