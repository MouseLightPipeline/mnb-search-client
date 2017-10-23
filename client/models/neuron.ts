import {IBrainArea} from "./brainArea";
import {ITracing} from "./tracing";

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
    tracings?: ITracing[];
    createAt: Date;
    updatedAt: Date;
}
