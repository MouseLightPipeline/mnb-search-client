import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {displayNeuronalStructure, NeuronalStructure} from "../../models/neuronalStructure";

export class NeuronalStructureSelect extends DynamicSimpleSelect<NeuronalStructure> {
    protected selectLabelForOption(option: NeuronalStructure): any {
        return displayNeuronalStructure(option);
    }
}
