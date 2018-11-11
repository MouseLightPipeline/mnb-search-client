import * as React from "react";
import {Icon, List, SemanticICONS} from "semantic-ui-react";

import {IBrainArea} from "../../../models/brainArea";

export interface ICompartmentNode {
    name: string;
    toggled: boolean;
    isChecked: boolean;
    children: ICompartmentNode[];
    compartment: IBrainArea;
}

interface ICompartmentsProps {
    compartmentNode: ICompartmentNode;

    onToggle(node: ICompartmentNode): void;
    onSelect(node: ICompartmentNode): void;
}

export class CompartmentNode extends React.Component<ICompartmentsProps, {}> {
    private get IconName(): SemanticICONS {
        if (this.props.compartmentNode.toggled) {
            return "folder open";
        }

        return this.props.compartmentNode.children && this.props.compartmentNode.children.length > 0 ? "folder" : "file";
    }

    public render() {
        let items = null;

        if (this.props.compartmentNode.toggled && this.props.compartmentNode.children) {
            items = (
                <List.List>
                    {this.props.compartmentNode.children.map(c => (
                        <CompartmentNode key={c.name} compartmentNode={c}
                                         onToggle={this.props.onToggle}
                                         onSelect={this.props.onSelect}/>
                    ))}
                </List.List>
            );
        }

        return (
            <List.Item>
                <List.Icon name={this.IconName} onClick={() => this.props.onToggle(this.props.compartmentNode)}/>
                <List.Content>
                    <List.Description onClick={() => this.props.onSelect(this.props.compartmentNode)}>
                        <Icon name={this.props.compartmentNode.isChecked ? "check square outline" : "square outline"}/>
                        {this.props.compartmentNode.name}
                    </List.Description>
                    {items}
                </List.Content>
            </List.Item>
        );
    }
}
