import * as React from "react";
import {observer} from "mobx-react-lite";
import {List, Icon} from "semantic-ui-react";

import {CompartmentViewModel} from "../../../store/viewModel/compartment/compartmentViewModel";
import {useViewModel} from "../../app/App";

type CompartmentHistoryItemProps = {
    compartment: CompartmentViewModel;
}

const CompartmentHistoryItem = observer((props: CompartmentHistoryItemProps) => {
    const {Compartments} = useViewModel();

    const visible = Compartments.VisibleCompartments.includes(props.compartment);

    return (
        <List.Item style={{paddingLeft: "12px"}}>
            <List.Content floated="right">
                {visible ? null :
                    <Icon name="remove" color="red" onClick={() => Compartments.History.removeCompartment(props.compartment)}/>
                }
            </List.Content>
            <List.Icon name={visible ? "check square outline" : "square outline"}
                       onClick={() => Compartments.toggle(props.compartment.compartment.id)}/>
            <List.Content onClick={() => Compartments.toggle(props.compartment.compartment.id)}>
                {props.compartment.compartment.name}
            </List.Content>
        </List.Item>
    )
});

export const CompartmentHistory = observer(() => {
    const {Compartments} = useViewModel();

    const rows = Compartments.History.Compartments.map(v => {
        return (<CompartmentHistoryItem key={`bv_${v.compartment.id}`} compartment={v}/>)
    });

    return (
        <List divided relaxed style={{margin: 0, paddingTop: "6px", paddingBottom: "6px"}}>
            {rows}
        </List>
    );
});
