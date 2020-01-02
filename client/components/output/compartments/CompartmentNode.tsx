import * as React from "react";
import {observer} from "mobx-react-lite";
import {Icon, List, SemanticICONS} from "semantic-ui-react";

import {useViewModel} from "../../app/App";
import {CompartmentNode} from "../../../store/viewModel/compartment/compartmentTreeNode";
import {useCompartments} from "../../../hooks/useCompartments";

type CompartmentNodeProps = {
    compartmentNode: CompartmentNode;
    compartmentOnly: boolean;
}

export const CompartmentNodeView = observer((props: CompartmentNodeProps) => {
    const {Compartments} = useViewModel();
    const {VisibleCompartments} = useCompartments();

    let items = null;

    if (props.compartmentNode.isExpanded && !props.compartmentOnly && props.compartmentNode.children.length > 0) {
        items = (
            <List.List>
                {props.compartmentNode.children.map(c => (
                    <CompartmentNodeView key={c.name} compartmentNode={c}
                                         compartmentOnly={props.compartmentOnly}/>
                ))}
            </List.List>
        );
    }

    const isVisible = VisibleCompartments.includes(props.compartmentNode.compartment);

    const iconName = getIconName(props.compartmentOnly, props.compartmentNode.isExpanded, props.compartmentNode.children.length > 0);

    return (
        <List.Item>
            <List.Icon name={iconName} onClick={() => props.compartmentNode.toggleCollapsed()}/>
            <List.Content>
                <List.Description onClick={() => Compartments.toggle(props.compartmentNode.compartment.compartment.id)}>
                    <Icon name={isVisible ? "check square outline" : "square outline"}/>
                    {props.compartmentNode.name}
                </List.Description>
                {items}
            </List.Content>
        </List.Item>
    );
});

function getIconName(compartmentOnly: boolean, isOpen: boolean, hasChildren: boolean): SemanticICONS {
    if (compartmentOnly) {
        return "file";
    }

    if (isOpen) {
        return "folder open";
    }

    return hasChildren ? "folder" : "file";
}