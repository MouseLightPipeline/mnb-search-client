import * as React from "react";
import {Container, List, Table} from "semantic-ui-react";

import {CompartmentNode, ICompartmentNode} from "./CompartmentNode";

export interface ICompartmentsProps {
    rootNode: ICompartmentNode;

    onChangeLoadedGeometry(added: string[], removed: string[]): void;
}

export class Compartments extends React.Component<ICompartmentsProps, {}> {
    public onSelect = (node: ICompartmentNode) => {
        node.isChecked = !node.isChecked;

        const added = node.isChecked ? [node.compartment.id] : [];
        const remove = node.isChecked ? [] : [node.compartment.id];

        this.props.onChangeLoadedGeometry(added, remove);
    };

    public onToggle = (node: ICompartmentNode) => {
        if (node.children) {
            node.toggled = !node.toggled;
        }

        this.setState({selectedNode: node});
    };

    public render() {
        if (this.props.rootNode === null) {
            return null;
        }

        return (
            <Container fluid>
                <Table basic="very">
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell width={8} verticalAlign="top">
                                <List>
                                    <CompartmentNode compartmentNode={this.props.rootNode}
                                                     onToggle={(node) => this.onToggle(node)}
                                                     onSelect={(node) => this.onSelect(node)}/>
                                </List>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}
