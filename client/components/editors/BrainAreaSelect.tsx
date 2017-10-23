import * as React from "react";

import {DynamicSimpleMultiSelect} from "ndb-react-components";
import {displayBrainArea, IBrainArea} from "../../models/brainArea";

export class BrainAreaSelect extends DynamicSimpleMultiSelect<IBrainArea> {
    protected selectLabelForOption(option: IBrainArea): any {
        return displayBrainArea(option);
    }
}
