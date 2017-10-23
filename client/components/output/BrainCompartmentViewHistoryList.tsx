import * as React from "react";
import {Glyphicon, Checkbox, ListGroup, ListGroupItem} from "react-bootstrap";

import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";

interface IBrainVolumesTableRowProps {
    brainAreaViewModel: BrainCompartmentViewModel;

    onToggleCompartmentSelected(id: string): void;
    onRemoveFromHistory(viewModel: BrainCompartmentViewModel): void;
}

interface IBrainVolumesTableRowState {
}

class BrainCompartmentViewHistoryList extends React.Component<IBrainVolumesTableRowProps, IBrainVolumesTableRowState> {
    public render() {
        const v = this.props.brainAreaViewModel;

        return (
            <ListGroupItem
                style={{paddingTop: "4px", paddingBottom: "4px", borderRadius: 0, backgroundColor: "#efefef"}}>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <div style={{flex: "1 1 auto", order: 1}}>
                        <Checkbox style={{margin: "0px", display: "inline-block"}}
                                  onChange={() => this.props.onToggleCompartmentSelected(v.compartment.id)}
                                  checked={v.isDisplayed}>{v.compartment.name}
                        </Checkbox>
                    </div>
                    <div style={{flex: "0 0 auto", order: 2}}>
                        {v.isDisplayed ? null :
                            <Glyphicon glyph="remove" className="pull-right" style={{paddingTop: "2px"}}
                                       onClick={() => this.props.onRemoveFromHistory(v)}/>
                        }
                    </div>
                </div>
            </ListGroupItem>
        )
    }
}

export interface IBrainVolumesTableProps {
    brainAreaViewModels: BrainCompartmentViewModel[];

    onToggleCompartmentSelected(id: string): void;
    onRemoveFromHistory(viewModel: BrainCompartmentViewModel): void;
}

interface IBrainVolumesTableState {
}

export class BrainVolumesTable extends React.Component<IBrainVolumesTableProps, IBrainVolumesTableState> {

    public render() {
        if (!this.props.brainAreaViewModels || this.props.brainAreaViewModels.length === 0) {
            return null;
        }

        const rows: any = this.props.brainAreaViewModels.filter(c => c.shouldIncludeInHistory).map(v => {
            return (<BrainCompartmentViewHistoryList key={`bv_${v.compartment.id}`} brainAreaViewModel={v}
                                                     onToggleCompartmentSelected={this.props.onToggleCompartmentSelected}
                                                     onRemoveFromHistory={this.props.onRemoveFromHistory}/>)
        });

        return (
            <ListGroup style={{margin: 0}}>
                {rows}
            </ListGroup>
        );
    }
}
