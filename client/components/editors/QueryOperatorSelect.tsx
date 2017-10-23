import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {displayQueryOperator, IQueryOperator} from "../../models/queryOperator";

export class QueryOperatorSelect extends DynamicSimpleSelect<IQueryOperator> {
    protected selectLabelForOption(option: IQueryOperator): any {
        return displayQueryOperator(option);
    }
}
