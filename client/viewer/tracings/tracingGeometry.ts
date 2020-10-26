import {Object3D} from "three";

export interface ITracingGeometry {
    AspectRatio: number;
    FieldOfView: number;

    createNeuron(swc_json: any, particleScale: number, color: string): Object3D;
}
