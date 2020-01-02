import {Object3D, Scene} from "three";

import {SharkViewer} from "../shark_viewer";
import {SystemShader} from "../shaders/shaders";
import {Point3D} from "../../util/viewerTypes";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {CompartmentId} from "../compartmentManager";

export type TracingId = string;

export class TracingManager {
    private readonly _scene: Scene;
    private readonly _shader: SystemShader;

    private _centerPoint: Point3D = [TomographyConstants.Instance.Sagittal.Center, TomographyConstants.Instance.Horizontal.Center, TomographyConstants.Instance.Coronal.Center];

    private _tracings = new Map<TracingId, Object3D>();

    public constructor(viewer: SharkViewer) {
        this._scene = viewer.Scene;
        this._shader = viewer.Shader;
    }

    public get Scene(): Scene {
        return this._scene;
    }
}