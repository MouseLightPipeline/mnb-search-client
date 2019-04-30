import {IBrainArea} from "./brainArea";
import {ITracing} from "./tracing";
import {ISample} from "./sample";

export interface INeuron {
    id: string;
    idNumber: number;
    idString: string;
    tag: string;
    keywords: string;
    x: number;
    y: number;
    z: number;
    brainArea?: IBrainArea;
    sample?: ISample;
    tracings?: ITracing[];
    createAt: Date;
    updatedAt: Date;
}
