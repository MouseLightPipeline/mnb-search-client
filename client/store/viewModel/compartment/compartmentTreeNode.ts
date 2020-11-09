import {action, observable} from "mobx";
import {CompartmentViewModel} from "./compartmentViewModel";

export class CompartmentNode {
    @observable public name: string;
    @observable public isExpanded: boolean;
    @observable public children = observable.array<CompartmentNode>([]);

    public compartment: CompartmentViewModel;

    @action
    public toggleCollapsed() {
        if (this.children.length > 0) {
            this.isExpanded = !this.isExpanded
        }
    }

    public matches(str: string): boolean {
        let matches: boolean = this.name.toLowerCase().includes(str);

        if (!matches) {
            matches = this.compartment.compartment.acronym.toLowerCase().includes(str);
        }

        if (!matches && this.compartment.compartment.aliases && this.compartment.compartment.aliases.length > 0) {
            matches = this.compartment.compartment.aliases.some(a => a.includes(str));
        }

        return matches;
    }
}

