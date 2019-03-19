import * as THREE from "three";

import {SlicePlane, SliceService} from "../slice/sliceService";

export type SliceSize = [number, number];

export const SliceSizeMap = new Map<SlicePlane, SliceSize>();

SliceSizeMap.set(SlicePlane.Coronal, [10400.0076, 7429.3582]);
SliceSizeMap.set(SlicePlane.Horizontal, [10400.0076, 13187.6221]);
SliceSizeMap.set(SlicePlane.Sagittal, [13187.6221, 7429.3582]);

export class SliceManager {
    private readonly _sampleId: string;

    private _sliceService: SliceService;

    private _scene: THREE.Scene;


    private _plane: THREE.Mesh = null;
    private _texture: THREE.Texture = null;
    private _mask: THREE.Texture = null;

    public get Scene(): THREE.Scene {
        return this._scene;
    }

    public get SampleId(): string {
        return this._sampleId;
    }

    public constructor(sampleId: string, scene?: THREE.Scene) {
        this._sampleId = sampleId;

        this.initializeSliceService();

        this.initialize(scene).then();
    }

    public async initialize(scene?: THREE.Scene) {
        if (scene !== undefined && scene !== null) {
            this._scene = scene;
        }

        if (this._scene) {
            const images = await this._sliceService.requestSlice({
                plane: SlicePlane.Coronal,
                location: 7000,
                invert: false
            });

            this._texture = new THREE.Texture();
            this._texture.image = images.image;
            this._texture.needsUpdate = true;

            this._mask = new THREE.Texture();
            this._mask.image = images.mask;
            this._mask.needsUpdate = true;

            const material = SliceManager.createSliceMaterial(this._texture, this._mask);

            this._plane = SliceManager.createSlice(SlicePlane.Coronal, material);

            this.Scene.add(this._plane);
        }
    }

    public showSlice(plane: SlicePlane, location: number) {

    }

    private initializeSliceService() {
        this._sliceService = new SliceService(this._sampleId);
    }

    private static createSlice(plane: SlicePlane, material: THREE.Material): THREE.Mesh {
        const size = SliceSizeMap.get(plane);

        const geometry = new THREE.PlaneGeometry(size[0], size[1], 32);

        switch (plane){
            case SlicePlane.Coronal:
                geometry.scale(1, -1, 1);
                break;
            case SlicePlane.Horizontal:
                geometry.rotateX(Math.PI/2);
                break;
            case SlicePlane.Sagittal:
                geometry.rotateY(Math.PI/2);
                break;
        }

        return new THREE.Mesh(geometry, material);
    }

    private static createSliceMaterial(texture: THREE.Texture, maskTexture: THREE.Texture): THREE.Material {
        return new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap: maskTexture,
            color: 0xffffff,
            side: THREE.DoubleSide,
            opacity: 1.0,
            transparent: true,
            depthTest: false
        });
    }
}
