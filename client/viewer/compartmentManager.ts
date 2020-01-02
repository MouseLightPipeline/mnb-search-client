import {Color, DoubleSide, Mesh, Object3D, OBJLoader, ShaderMaterial, Scene} from "three";
import {difference} from "lodash"

import {Point3D} from "../util/viewerTypes";
import {TomographyConstants} from "../tomography/tomographyConstants";
import {SystemShader} from "./shaders/shaders";
import {CompartmentViewModel} from "../store/viewModel/compartment/compartmentViewModel";
import {SharkViewer} from "./shark_viewer";

export type CompartmentId = string;

export class CompartmentManager {
    private readonly _rootPath: string;
    private readonly _scene: Scene;
    private readonly _shader: SystemShader;

    private _centerPoint: Point3D = [TomographyConstants.Instance.Sagittal.Center, TomographyConstants.Instance.Horizontal.Center, TomographyConstants.Instance.Coronal.Center];

    private _compartments = new Map<CompartmentId, Object3D>();

    public constructor(rootPath: string, viewer: SharkViewer) {
        this._rootPath = rootPath;
        this._scene = viewer.Scene;
        this._shader = viewer.Shader;
    }

    public get Scene(): Scene {
        return this._scene;
    }

    public renderCompartments(compartments: CompartmentViewModel[]) {
        if (compartments.length === 0) {
            this.hideAll();
            return;
        }

        compartments.forEach(c => {
            if (!this._compartments.has(c.compartment.id)) {
                this.loadCompartment(c.compartment.id, c.compartment.geometryFile, c.compartment.geometryColor)
            } else {
                const obj = this.setVisibleForId(c.compartment.id, true);
            }
        });

        const requestedIds = compartments.map(c => c.compartment.id);

        const knownCompartments = Array.from(this._compartments.keys());
        const visibleCompartments = knownCompartments.filter(id => this._compartments.get(id)?.visible || false);

        const toHide = difference(visibleCompartments, requestedIds);
        toHide.forEach(id => this.setVisibleForId(id, false));
    }

    private static setVisible(compartment: Object3D, visible: boolean) {
        // May be in the process of loading.
        if (compartment != null) {
            compartment.visible = visible;
        }
    }

    private setVisibleForId(id: string, visible: boolean) {
        CompartmentManager.setVisible(this._compartments.get(id), visible);
    }

    private hideAll() {
        this._compartments.forEach(c => CompartmentManager.setVisible(c, false));
    }

    private loadCompartment(id: CompartmentId, geometryFile: string, color: string) {
        // Mark that compartment has been requested.

        this._compartments.set(id, null);

        const loader = new OBJLoader();

        const path = this._rootPath + geometryFile;

        loader.load(path, (object: Object3D) => {
            object.traverse((child: Object3D) => {
                if (child instanceof Mesh) {
                    child.material = new ShaderMaterial({
                        uniforms: {
                            color: {type: 'c', value: new Color('#' + color)},
                        },
                        vertexShader: this._shader.CompartmentShader.VertexShader,
                        fragmentShader: this._shader.CompartmentShader.FragmentShader,
                        transparent: true,
                        depthTest: true,
                        depthWrite: false,
                        side: DoubleSide,
                    });
                }
            });

            object.name = id;

            object.position.set(-this._centerPoint[0], -this._centerPoint[1], -this._centerPoint[2]);

            this._compartments.set(id, object);

            this._scene.add(object);
        });
    }

    private unloadCompartment(id: CompartmentId) {
        const selectedObj = this._scene.getObjectByName(id);
        this._scene.remove(selectedObj);
    }
}