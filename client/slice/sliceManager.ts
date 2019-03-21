import * as THREE from "three";

import {SlicePlane, SliceService} from "./sliceService";
import {Slice} from "./slice";

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

            slice.updateTexture(location, images);
        }
    }

    public showSlice(plane: SlicePlane): Slice {
        let slice = this._sliceMap.get(plane);

        if (slice === undefined) {
            slice = new Slice(plane);

            this._sliceMap.set(plane, slice);

            this.updateSlice(plane, centerPoint[plane - 1]).then();
        }

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

const centerPoint = [5687.5436, 3849.609985, 6595.3813];