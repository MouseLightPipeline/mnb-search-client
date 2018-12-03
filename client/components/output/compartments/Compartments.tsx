import * as React from "react";
import {Container, Input, List} from "semantic-ui-react";

import {CompartmentNode, CompartmentNodeView} from "./CompartmentNode";
import {compartmentNodeSortedList} from "../MainView";

type CompartmentsProps = {
    rootNode: CompartmentNode;

    onChangeLoadedGeometry(added: string[], removed: string[]): void;
}

type CompartmentsState = {
    filterText: string;
    selectedNode: CompartmentNode;
}

export class Compartments extends React.Component<CompartmentsProps, CompartmentsState> {
    public constructor(props: CompartmentsProps) {
        super(props);

        this.state = {
            filterText: "",
            selectedNode: null
        }
    }

    public onSelect = (node: CompartmentNode) => {
        node.isChecked = !node.isChecked;

        const added = node.isChecked ? [node.compartment.id] : [];
        const remove = node.isChecked ? [] : [node.compartment.id];

        this.props.onChangeLoadedGeometry(added, remove);
    };

    public onToggle = (node: CompartmentNode) => {
        if (node.children) {
            node.toggled = !node.toggled;
        }

        this.setState({selectedNode: node});
    };

    public render() {
        if (this.props.rootNode === null) {
            return null;
        }

        let list = null;

        if (this.state.filterText) {
            const items = compartmentNodeSortedList.filter(c => c.matches(this.state.filterText));

            const listItems = items.map(c => (
                <CompartmentNodeView key={c.name} compartmentNode={c}
                                     compartmentOnly={true}
                                     onToggle={() => {
                                     }}
                                     onSelect={(node) => this.onSelect(node)}/>
            ));
            list = (
                <List>
                    {listItems}
                </List>
            );
        } else {
            list = (
                <List>
                    <CompartmentNodeView compartmentNode={this.props.rootNode}
                                         compartmentOnly={false}
                                         onToggle={(node) => this.onToggle(node)}
                                         onSelect={(node) => this.onSelect(node)}/>
                </List>
            );
        }

        return (
            <Container fluid>
                <div>
                    <Input size="mini" icon='search' placeholder='Search...' fluid
                           onChange={(e, {value}) => this.setState({filterText: value.toLowerCase()})}/>
                </div>
                <div style={{padding: "10px"}}>
                    {list}
                </div>
            </Container>
        );
    }
}
