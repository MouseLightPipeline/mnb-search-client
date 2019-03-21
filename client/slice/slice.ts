import * as THREE from "three";
import {SliceImage, SlicePlane} from "./sliceService";

type SliceSize = [number, number];

const SliceSizeMap = new Map<SlicePlane, SliceSize>();

SliceSizeMap.set(SlicePlane.Coronal, [10400.0076, 7429.3582]);
SliceSizeMap.set(SlicePlane.Horizontal, [10400.0076, 13187.6221]);
SliceSizeMap.set(SlicePlane.Sagittal, [13187.6221, 7429.3582]);

const centerPoint = [5687.5436, 3849.609985, 6595.3813];

export class Slice {
    private readonly _mesh: THREE.Object3D = null;
    private readonly _texture: THREE.Texture = null;
    private readonly _mask: THREE.Texture = null;
    private readonly _slicePlane = null;

    private _geometry: THREE.Geometry = null;
    private _location: number;

    public constructor(plane: SlicePlane) {
        this._slicePlane = plane;

        this._texture = new THREE.Texture();
        this._mask = new THREE.Texture();

        const material = Slice.createSliceMaterial(this._texture, this._mask);

        this._mesh = this.createSlice(plane, material);
    }

    public get Mesh(): THREE.Object3D {
        return this._mesh;
    }

    private get Location(): number {
        return this._location;
    }

    private set Location(location: number) {
        switch (this._slicePlane) {
            case SlicePlane.Sagittal:
                this._mesh.position.set(location - centerPoint[0], 0, 0);
                break;
            case SlicePlane.Horizontal:
                this._mesh.position.set(0, location - centerPoint[1], 0);
                break;
            case SlicePlane.Coronal:
                this._mesh.position.set(0, 0, location - centerPoint[2]);
                break;
        }
    }

    public updateTexture(location, image: SliceImage) {
        if (location !== null) {
            this.Location = location;
        }

        if (image !== null) {
            this._texture.image = image.image;
            this._texture.needsUpdate = true;

            this._mask.image = image.mask;
            this._mask.needsUpdate = true;
        }
    }

    private createSlice(plane: SlicePlane, material: THREE.Material): THREE.Object3D {
        const size = SliceSizeMap.get(plane);

        this._geometry = new THREE.PlaneGeometry(size[0], size[1], 32);

        switch (plane) {
            case SlicePlane.Sagittal:
                this._geometry.rotateY(Math.PI / 2);
                this._geometry.scale(1, -1, -1);
                break;
            case SlicePlane.Horizontal:
                this._geometry.rotateX(Math.PI / 2);
                this._geometry.scale(1, 1, -1);
                break;
            case SlicePlane.Coronal:
                this._geometry.scale(1, -1, 1);
                break;
        }

        return new THREE.Mesh(this._geometry, material);
    }

    private static createSliceMaterial(texture: THREE.Texture, maskTexture: THREE.Texture): THREE.Material {
        return new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap: maskTexture,
            alphaTest: 0.5,
            color: 0xffffff,
            side: THREE.DoubleSide,
            opacity: 1.0,
            transparent: false,
            depthTest: true
        });
    }
}