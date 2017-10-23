import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {BrainAreaFilterType} from "../../models/brainAreaFilterType";

export class BrainAreaFilterTypeSelect extends DynamicSimpleSelect<BrainAreaFilterType> {
    protected selectLabelForOption(option: BrainAreaFilterType): any {
        return option ? option.name : "";
    }
}
