import * as React from "react";
import {Glyphicon, Dropdown, MenuItem} from "react-bootstrap";

import {INeuronTableProps, NeuronTable} from "./NeuronTable";
import {DrawerState} from "./MainView";
import {QueryStatus} from "../query/QueryHeader";
import {primaryBackground} from "../../util/styles";
import {ExportFormat} from "../../models/tracing";

interface INeuronListContainerProps extends INeuronTableProps {
    isDocked: boolean;
    queryStatus: QueryStatus;

    onClickCloseOrPin(state: DrawerState): void;
    onRequestExport(format: ExportFormat): void;
}

interface INeuronListContainerState {
}

export class NeuronListContainer extends React.Component<INeuronListContainerProps, INeuronListContainerState> {
    public constructor(props: INeuronListContainerProps) {
        super(props);

        this.state = {}
    }

    private performExport(format: ExportFormat) {

    }

    private renderCloseGlyph() {
        const transform = this.props.isDocked ? "rotate(-45deg)" : "";
        const state = this.props.isDocked ? DrawerState.Float : DrawerState.Dock;

        return (
            <Glyphicon glyph="pushpin" style={{margin: "auto", order: 3, marginRight: "10px", transform: transform}}
                       onClick={() => this.props.onClickCloseOrPin(state)}/>
        );
    }

    private renderExport() {
        /*
        const count = this.props.neuronViewModels.reduce((c, n) => {return n.isSelected ? c + 1 : c}, 0);

        let menus = [];

        if (count <= 20) {
            menus[0] = (<MenuItem key="1" eventKey={ExportFormat.SWC}>Export SWC</MenuItem>);
            menus[1] = (<MenuItem key="2" eventKey={ExportFormat.JSON}>Export JSON</MenuItem>);
        } else {
            menus[0] = (<MenuItem disabled={true}>Please select 20 or fewer tracings to export</MenuItem>);
        }

        return (
            <Dropdown id="dropdown-custom-1" style={{backgroundColor: "transparent", border: "none"}} disabled={count <= 0} onSelect={(f) => this.props.onRequestExport(f)}>
                <Dropdown.Toggle style={{backgroundColor: "transparent", border: "none", color: "white"}}>
                    <Glyphicon glyph="save"/>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{fontSize: "11px", fontWeight: "normal"}}>
                    {menus}
                </Dropdown.Menu>
            </Dropdown>
        );
        */
        return null;
    }

    private renderHeader() {
        return (
            <div style={{
                backgroundColor: primaryBackground,
                color: "white",
                maxHeight: "40px",
                minHeight: "40px",
                width: "100%",
                margin: 0,
                padding: "6px",
                display: "flex",
                order: 1,
                flexDirection: "row"
            }}>
                {this.props.isDocked ? this.renderExport() : null}
                <h4 style={{
                    color: "white",
                    fontWeight: "lighter",
                    margin: "auto",
                    marginLeft: "33px",
                    textAlign: "center",
                    flexGrow: 1,
                    order: 2
                }}>Neurons</h4>
                {this.renderCloseGlyph()}
                <Glyphicon glyph="chevron-left" style={{margin: "auto", order: 4}}
                           onClick={() => this.props.onClickCloseOrPin(DrawerState.Hidden)}/>
            </div>
        );
    }

    public render() {
        let content = null;

        if (this.props.queryStatus === QueryStatus.NeverQueried) {
            content = (
                <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Perform a query to view
                    matching neurons</h5>);
        } else if (this.props.queryStatus === QueryStatus.Loading) {
            if (this.props.neuronViewModels.length === 0) {
                content = (
                    <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Loading</h5>);
            } else {
                content = ( <NeuronTable {...this.props}/>);
            }
        } else {
            if (this.props.neuronViewModels.length === 0) {
                content = (
                    <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>No neurons
                        found</h5>);
            } else {
                content = ( <NeuronTable {...this.props}/>);
            }
        }

        return (
            <div style={{
                backgroundColor: "#efefef",
                opacity: this.props.isDocked ? 1.0 : 0.75,
                flexDirection: "column",
                flexWrap: "nowrap",
                order: 1,
                width: "500px",
                minWidth: "500px",
                height: "100%",
                flexGrow: 0,
                flexShrink: 0,
                display: "flex",
                border: "1px solid"
            }}>
                {this.renderHeader()}
                <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                    {content}
                </div>
            </div>
        );
    }
}
