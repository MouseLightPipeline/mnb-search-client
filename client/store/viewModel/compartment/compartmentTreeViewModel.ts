import {CompartmentNode} from "./compartmentTreeNode";
import {action, observable} from "mobx";
import {CompartmentViewModel} from "./compartmentViewModel";

// A couple of hard-coded exceptions.  If this grows, should have a db column.
const RETINA = 304325711;
const GROOVES = 1024;

export class CompartmentTreeViewModel {
    @observable public RootNode: CompartmentNode;

    @observable public IsFiltered: boolean = false;

    @observable public FilterText: string = "";

    @observable public FilteredNodes = observable.array<CompartmentNode>([]);

    private readonly _compartmentNodes: CompartmentNode[] = [];

    public constructor(compartments: CompartmentViewModel[]) {
        this.RootNode = new CompartmentNode();
        this.RootNode.name = compartments[0].compartment.name;
        this.RootNode.isExpanded = true;
        this.RootNode.compartment = compartments[0];

        this._compartmentNodes.push(this.RootNode);

        const children = compartments.slice(1);

        const compartmentNodeMap = new Map<number, CompartmentNode>();

        compartmentNodeMap.set(this.RootNode.compartment.compartment.structureId, this.RootNode);

        children.forEach((c: CompartmentViewModel) => {
            if (c.compartment.structureId === RETINA || c.compartment.structureId === GROOVES) {
                return;
            }

            const node: CompartmentNode = new CompartmentNode();
            node.name = c.compartment.name;
            node.isExpanded = false;
            node.compartment = c;

            this._compartmentNodes.push(node);

            compartmentNodeMap.set(c.compartment.structureId, node);

            const parent = compartmentNodeMap.get(c.compartment.parentStructureId);

            if (parent) {
                parent.children.push(node);
            }
        });
    }

    @action
    public applyFilter(filter: string): void {
        if (filter.length > 0) {
            this.FilterText = filter;
            this.IsFiltered = true;
            this.FilteredNodes.replace(this._compartmentNodes.filter(c => c.matches(filter)));
        } else {
            this.FilterText = "";
            this.IsFiltered = false;
        }
    }
}

/*
// TODO View models in CompartmentTree view model.
function makeCompartmentNodes(compartments: CompartmentsViewModel): CompartmentNode {
    if (compartmentNodeMap.size > 0) {
        return compartmentNodeMap.get(ROOT);
    }

    let sorted = brainAreas.slice();

    const root: CompartmentNode = new CompartmentNode();
    root.name = sorted[0].name;
    root.isExpanded = true;
    root.compartment = sorted[0];

    compartmentNodeMap.set(sorted[0].structureId, root);
    compartmentNodeSortedList.push(root);

    sorted = sorted.slice(1);

    sorted.forEach((c: IBrainArea) => {
        if (c.structureId === RETINA || c.structureId === GROOVES) {
            return;
        }

        const node: CompartmentNode = new CompartmentNode();
        node.name = c.name;
        // node.isChecked = false;
        node.isExpanded = false;
        node.compartment = c;

        compartmentNodeMap.set(c.structureId, node);
        compartmentNodeSortedList.push(node);

        const parent = compartmentNodeMap.get(c.parentStructureId);

        if (parent) {
            parent.children.push(node);
        }
    });

    return root;
}
*/