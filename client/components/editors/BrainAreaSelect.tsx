import * as React from "react";


import {DynamicSimpleMultiSelect} from "./DynamicSelect";
import {displayBrainArea, IBrainArea} from "../../models/brainArea";

export class BrainAreaSelect extends DynamicSimpleMultiSelect<IBrainArea> {
    protected selectLabelForOption(option: IBrainArea): any {
        return displayBrainArea(option);
    }

    protected selectValueForOption(option: IBrainArea): any {
        return option;
    }
}
