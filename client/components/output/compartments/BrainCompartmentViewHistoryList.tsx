import * as React from "react";
import {List, Icon} from "semantic-ui-react";

import {BrainCompartmentViewModel} from "../../../viewmodel/brainCompartmentViewModel";

interface IBrainVolumesTableRowProps {
    brainAreaViewModel: BrainCompartmentViewModel;

    onToggleCompartmentSelected(id: string): void;
    onRemoveFromHistory(viewModel: BrainCompartmentViewModel): void;
}

const BrainCompartmentViewHistoryList = (props: IBrainVolumesTableRowProps) => {
    const v = props.brainAreaViewModel;

    return (
        <List.Item style={{paddingLeft: "12px"}}>
            <List.Content floated="right">
                {v.isDisplayed ? null :
                    <Icon name="remove" color="red" onClick={() => props.onRemoveFromHistory(v)}/>
                }
            </List.Content>
            <List.Icon name={v.isDisplayed ? "check square outline" : "square outline"} color="blue"
                       onClick={() => props.onToggleCompartmentSelected(v.compartment.id)}/>
            <List.Content onClick={() => props.onToggleCompartmentSelected(v.compartment.id)}>
                <span style={{color: "rgb(115, 135, 156)"}}>{v.compartment.name}</span>
            </List.Content>
        </List.Item>
    )
};

export interface IBrainVolumesTableProps {
    brainAreaViewModels: BrainCompartmentViewModel[];

    onToggleCompartmentSelected(id: string): void;
    onRemoveFromHistory(viewModel: BrainCompartmentViewModel): void;
}

export const BrainVolumesTable = (props: IBrainVolumesTableProps) => {
    if (!props.brainAreaViewModels || props.brainAreaViewModels.length === 0) {
        return null;
    }

    const rows: any = props.brainAreaViewModels.filter(c => c.shouldIncludeInHistory).map(v => {
        return (<BrainCompartmentViewHistoryList key={`bv_${v.compartment.id}`} brainAreaViewModel={v}
                                                 onToggleCompartmentSelected={props.onToggleCompartmentSelected}
                                                 onRemoveFromHistory={props.onRemoveFromHistory}/>)
    });

    return (
        <List divided relaxed style={{margin: 0, paddingTop: "6px", paddingBottom: "6px"}}>
            {rows}
        </List>
    );
};
