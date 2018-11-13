import * as React from "react";

import {INeuronTableProps, NeuronTable} from "./NeuronTable";
import {DrawerState} from "./MainView";
import {QueryStatus} from "../query/QueryHeader";
import {primaryBackground} from "../../util/styles";
import {ExportFormat} from "../../models/tracing";
import {Dropdown, Icon} from "semantic-ui-react";

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

    private renderCloseGlyph() {
        const transform = this.props.isDocked ? "" : "rotate(-45deg)";
        const state = this.props.isDocked ? DrawerState.Float : DrawerState.Dock;

        return (
            <Icon name="pin" style={{margin: "auto", order: 3, marginRight: "10px", transform: transform}}
                  onClick={() => this.props.onClickCloseOrPin(state)}/>
        );
    }

    private renderExport() {
        const count = this.props.neuronViewModels.reduce((c, n) => {
            return n.isSelected ? c + 1 : c
        }, 0);

        let options = null;

        if (count <= 20) {
            options = [{
                key: ExportFormat.SWC,
                value: ExportFormat.SWC,
                text: "Export SWC"
            }, {
                key: ExportFormat.JSON,
                value:  ExportFormat.JSON,
                text: "Export JSON"
            }];
        } else {
            options = [{
                key: -1,
                text: "Please select 20 or fewer tracings to export",
                disabled: true
            }];
        }

        return <Dropdown trigger={<Icon name="download"/>} value={null} options={options} disabled={count === 0} onChange={(evt, {value}) => this.props.onRequestExport(value as ExportFormat)}/>
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
                {this.renderExport()}
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
                <Icon name="chevron left" style={{margin: "auto", order: 4}}
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
                content = (<NeuronTable {...this.props}/>);
            }
        } else {
            if (this.props.neuronViewModels.length === 0) {
                content = (
                    <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>No neurons
                        found</h5>);
            } else {
                content = (<NeuronTable {...this.props}/>);
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
