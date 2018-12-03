export enum BrainAreaFilterTypeOption {
    AnatomicalRegion = 1,
    CustomRegion = 2,
    IdOrDoi = 3
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
        return this.option === BrainAreaFilterTypeOption.AnatomicalRegion;
    }

    public get IsCustomRegionQuery(): boolean {
        return this.option === BrainAreaFilterTypeOption.CustomRegion;
    }

    public get IsIdQuery(): boolean {
        return this.option === BrainAreaFilterTypeOption.IdOrDoi;
    }
}

export let BRAIN_AREA_FILTER_TYPE_COMPARTMENT: BrainAreaFilterType = null;
export let BRAIN_AREA_FILTER_TYPE_SPHERE: BrainAreaFilterType = null;
export let BRAIN_AREA_FILTER_TYPE_ID: BrainAreaFilterType = null;

const brainAreaFilterTypeLookup = new Map<number, BrainAreaFilterType>();

export const BRAIN_AREA_FILTER_TYPES: BrainAreaFilterType[] = makeBrainAreaFilterTypes();

export function findBrainAreaFilterType(option: BrainAreaFilterTypeOption) {
    return brainAreaFilterTypeLookup.get(option);
}

function makeBrainAreaFilterTypes(): BrainAreaFilterType[] {

    const modes: BrainAreaFilterType[] = [];

    BRAIN_AREA_FILTER_TYPE_COMPARTMENT = new BrainAreaFilterType("c7c6a2c7-e92a-4c3b-8308-cef92114ecbb", "Anatomical Region", BrainAreaFilterTypeOption.AnatomicalRegion);
    modes.push(BRAIN_AREA_FILTER_TYPE_COMPARTMENT);

    BRAIN_AREA_FILTER_TYPE_SPHERE = new BrainAreaFilterType("4780c646-f31b-42e6-bdf1-ff381b212e82", "Custom Region", BrainAreaFilterTypeOption.CustomRegion);
    modes.push(BRAIN_AREA_FILTER_TYPE_SPHERE);

    BRAIN_AREA_FILTER_TYPE_ID = new BrainAreaFilterType("10e81282-b7b9-4deF-b894-797e52780306", "Id or DOI", BrainAreaFilterTypeOption.IdOrDoi);
    modes.push(BRAIN_AREA_FILTER_TYPE_ID);

    modes.map(m => {
       brainAreaFilterTypeLookup.set(m.option, m);
    });

    return modes;
}
