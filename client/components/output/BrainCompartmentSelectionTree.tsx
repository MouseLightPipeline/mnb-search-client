import * as React from "react";
import * as CheckboxTree from "react-checkbox-tree";
import * as _ from "lodash";

import {NdbConstants} from "../../models/constants";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";

export interface IBrainAreaGeometryProps {
    constants: NdbConstants;
    brainAreaViewModels: BrainCompartmentViewModel[];
    nodes: any[];
    expanded: string[];

    onChangeBrainAreaExpanded(expanded: string[]): void;
    onChangeLoadedGeometry(added: string[], removed: string[]): void;
}

interface IBrainAreaGeometryState {
}

export class BrainCompartmentSelectionTree extends React.Component<IBrainAreaGeometryProps, IBrainAreaGeometryState> {
    public render() {
        return (
            <CheckboxTree style={{height: "100%"}}
                nodes={this.props.nodes}
                optimisticToggle={false}
                checked={this.props.brainAreaViewModels.filter(c => c.isDisplayed).map(c => c.compartment.id)}
                expanded={this.props.expanded}
                onCheck={(checked: string[]) => {
                    const prior = this.props.brainAreaViewModels.filter(c => c.isDisplayed).map(c => c.compartment.id);
                    const newlyChecked = _.difference(checked, prior);
                    const noLongerChecked = _.difference(prior, checked);
                    this.props.onChangeLoadedGeometry(newlyChecked, noLongerChecked)
                }}
                onExpand={(expanded: string[]) => {
                    this.props.onChangeBrainAreaExpanded(expanded);
                }}
            />
        );
    }
}
