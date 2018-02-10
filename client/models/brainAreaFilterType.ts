export enum BrainAreaFilterTypeOption {
    Compartments = 1,
    Sphere = 2
}

export class BrainAreaFilterType {
    id: string;
    name: string;
    option: BrainAreaFilterTypeOption;

    public constructor(id: string, name: string, option: BrainAreaFilterTypeOption) {
        this.id = id;
        this.name = name;
        this.option = option;
    }

    public get IsCompartmentQuery(): boolean {
        return this.option === BrainAreaFilterTypeOption.Compartments;
    }
}

export let BRAIN_AREA_FILTER_TYPE_COMPARTMENT: BrainAreaFilterType = null;
export let BRAIN_AREA_FILTER_TYPE_SPHERE: BrainAreaFilterType = null;

const brainAreaFilterTypeLookup = new Map<number, BrainAreaFilterType>();

export const BRAIN_AREA_FILTER_TYPES: BrainAreaFilterType[] = makeBrainAreaFilterTypes();

export function findBrainAreaFilterType(option: BrainAreaFilterTypeOption) {
    return brainAreaFilterTypeLookup.get(option);
}

function makeBrainAreaFilterTypes(): BrainAreaFilterType[] {

    const modes: BrainAreaFilterType[] = [];

    BRAIN_AREA_FILTER_TYPE_COMPARTMENT = new BrainAreaFilterType("c7c6a2c7-e92a-4c3b-8308-cef92114ecbb", "Anatomical Region", BrainAreaFilterTypeOption.Compartments);
    modes.push(BRAIN_AREA_FILTER_TYPE_COMPARTMENT);

    BRAIN_AREA_FILTER_TYPE_SPHERE = new BrainAreaFilterType("4780c646-f31b-42e6-bdf1-ff381b212e82", "Custom Region", BrainAreaFilterTypeOption.Sphere);
    modes.push(BRAIN_AREA_FILTER_TYPE_SPHERE);

    modes.map(m => {
       brainAreaFilterTypeLookup.set(m.option, m);
    });

    return modes;
}
