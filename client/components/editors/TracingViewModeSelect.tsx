import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {NeuronViewMode} from "../../viewmodel/neuronViewMode";

export class TracingViewModeSelect extends DynamicSimpleSelect<NeuronViewMode> {
    protected selectLabelForOption(option: NeuronViewMode): any {
        return option ? option.id : "";
    }
}
