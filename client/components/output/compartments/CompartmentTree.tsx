import * as React from "react";
import {observer} from "mobx-react-lite";
import {Container, Input, List} from "semantic-ui-react";

import {useCompartments} from "../../../hooks/useCompartments";
import {CompartmentNodeView} from "./CompartmentNode";

export const CompartmentTree = observer(() => {
    const {Tree} = useCompartments();

    let list = null;

    if (Tree.IsFiltered) {
        const listItems = Tree.FilteredNodes.map(c => (
            <CompartmentNodeView key={c.name} compartmentNode={c} compartmentOnly={true}/>
        ));

        list = (
            <List>
                {listItems}
            </List>
        );
    } else {
        list = (
            <List>
                <CompartmentNodeView compartmentNode={Tree.RootNode} compartmentOnly={false}/>
            </List>
        );
    }

    return (
        <Container fluid>
            <div>
                <Input size="mini" icon="search" iconPosition="left"
                       action={{icon: "cancel", as: "div", onClick: () => Tree.applyFilter("")}}
                       placeholder='Filter compartments...' fluid value={Tree.FilterText}
                       className="compartment-search"
                       onChange={(e, {value}) => Tree.applyFilter(value.toLowerCase())}/>
            </div>
            <div style={{padding: "10px"}}>
                {list}
            </div>
        </Container>
    );
});
