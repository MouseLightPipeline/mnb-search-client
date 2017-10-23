import {INodeBase} from "./nodeBase";
import {IBrainArea} from "./brainArea";
import {ISwcNode} from "./swcNode";
import {IStructureIdentifier} from "./structureIdentifier";

export interface ITracingNode extends INodeBase {
    id: string;
    sampleNumber: number;
    parentNumber: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    structureIdValue: number;
    structureIdentifier: IStructureIdentifier;
    structureIdentifierId: string;
    swcNode?: ISwcNode;
    brainArea?: IBrainArea;
    brainAreaId?: string;
}
