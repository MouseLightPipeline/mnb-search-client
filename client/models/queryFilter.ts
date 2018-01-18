import {IQueryOperator} from "./queryOperator";
import {IBrainArea} from "./brainArea";
import {NeuronalStructure} from "./neuronalStructure";
import {BrainAreaFilterType, BrainAreaFilterTypeOption, findBrainAreaFilterType} from "./brainAreaFilterType";
import {NdbConstants} from "./constants";

export enum FilterComposition {
    and = 1,
    or = 2,
    not = 3
}

export interface IPositionInput {
    x: number;
    y: number;
    z: number;
}

export interface IFilterInput {
    tracingIdOrDoi: string;
    tracingStructureIds: string[];
    nodeStructureIds: string[];
    operatorId: string;
    amount: number;
    brainAreaIds: string[];
    arbCenter: IPositionInput;
    arbSize: number;
    invert: boolean;
    composition: number;
    nonce: string;
}


export interface IPosition {
    x: string;
    y: string;
    z: string;

    [key: string]: string;
}

export interface IQueryFilter {
    tracingIdOrDoi: string;
    neuronalStructure: NeuronalStructure;
    operator: IQueryOperator;
    amount: string;
    brainAreas: IBrainArea[];
    arbCenter: IPosition;
    arbSize: string;
    invert: boolean;
    composition: FilterComposition;
    nonce: string;

    IsAmountValid: boolean;
}

export class UIQueryFilter {
    id: string;
    index: number;
    brainAreaFilterType: BrainAreaFilterType;
    filter: FilterContents;

    public serialize() {
        return {
            id: this.id,
            index: this.index,
            brainAreaFilterTypeOption: this.brainAreaFilterType.option,
            filter: this.filter ? this.filter.serialize() : null
        }
    }

    public static deserialize(data: any, constants: NdbConstants): UIQueryFilter {
        const filter = new UIQueryFilter();

        filter.id = data.id || "";
        filter.index = data.index || 0;
        filter.brainAreaFilterType = findBrainAreaFilterType(data.brainAreaFilterTypeOption || BrainAreaFilterTypeOption.Compartments);

        filter.filter = data.filter ? FilterContents.deserialize(data.filter, constants) : null;

        return filter;
    }
}

export class FilterContents implements IQueryFilter {
    public tracingIdOrDoi: string;
    public neuronalStructure: NeuronalStructure;
    public operator: IQueryOperator;
    public amount: string;
    public brainAreas: IBrainArea[];
    public arbCenter: IPosition;
    public arbSize: string;
    public invert: boolean;
    public composition: FilterComposition;
    public nonce: string;

    public constructor(isDefaultQuery: boolean = false) {
        this.tracingIdOrDoi = null;
        this.neuronalStructure = null;
        this.operator = null;
        this.amount = "0";
        this.brainAreas = [];
        this.arbCenter = {x: "6500", y: "4000", z: "5500"};
        this.arbSize = "1000";
        this.invert = false;
        this.composition = isDefaultQuery ? FilterComposition.or : FilterComposition.and;
        this.nonce = null;
    }

    public get IsAmountValid(): boolean {
        return (this.amount.length !== 0) && !isNaN(parseFloat(this.amount));
    }

    public get CanHaveThreshold(): boolean {
        return !this.neuronalStructure || !this.neuronalStructure.IsSoma;
    }

    public serialize() {
        return {
            tracingIdOrDoi: this.tracingIdOrDoi,
            neuronalStructureId: this.neuronalStructure ? this.neuronalStructure.id : null,
            operatorId: this.operator ? this.operator.id : null,
            amount: this.amount,
            brainAreaStructureIds: this.brainAreas.map(b => b.structureId),
            arbCenter: this.arbCenter,
            arbSize: this.arbSize,
            invert: this.invert,
            composition: this.composition
        }
    }

    public static deserialize(data: any, constants: NdbConstants): FilterContents {
        const filter = new FilterContents();

        filter.tracingIdOrDoi = data.tracingIdOrDoi || null;
        filter.neuronalStructure = constants.findNeuronalStructure(data.neuronalStructureId);
        filter.operator = constants.findQueryOperator(data.operatorId);
        filter.amount = data.amount;
        filter.brainAreas = data.brainAreaStructureIds.map(s => constants.findBrainArea(s));
        filter.arbCenter = data.arbCenter;
        filter.arbSize = data.arbSize;
        filter.invert = data.invert;
        filter.composition = data.composition;

        return filter;
    }

}
