import * as React from "react";
import {Glyphicon} from "react-bootstrap";

import {BrainCompartmentSelectionTree, IBrainAreaGeometryProps} from "./BrainCompartmentSelectionTree";
import {BrainVolumesTable, IBrainVolumesTableProps} from "./BrainCompartmentViewHistoryList";
import {DrawerState} from "./MainView";
import {primaryBackground, secondaryyBackground} from "../../util/styles";


interface ICompartmentListContainerProps extends IBrainVolumesTableProps, IBrainAreaGeometryProps {
    isDocked: boolean;

    onClickCloseOrPin(state: DrawerState): void;
}

interface ICompartmentListContainerState {
}

export class CompartmentListContainer extends React.Component<ICompartmentListContainerProps, ICompartmentListContainerState> {
    public constructor(props: ICompartmentListContainerProps) {
        super(props);

        this.state = {}
    }

    private renderCloseGlyph() {
        const transform = this.props.isDocked ? "rotate(-45deg)" : "";
        const state =  this.props.isDocked ?DrawerState.Float : DrawerState.Dock;

        return (
            <Glyphicon glyph="pushpin" style={{margin: "auto", order: 2, marginLeft: "10px", transform: transform}}
                       onClick={() => this.props.onClickCloseOrPin(state)}/>
        );
    }

    private renderHeader() {
        return (
            <div style={{
                backgroundColor: primaryBackground,
                color: "white",
                height: "40px",
                minHeight: "40px",
                width: "100%",
                margin: 0,
                padding: "6px",
                display: "flex",
                order: 1,
                flexDirection: "row"
            }}>
                <h4 style={{color: "white", fontWeight: "lighter", margin: "auto", marginRight: "33px", textAlign: "center", flexGrow: 1, order: 3}}>Compartments</h4>
                {this.renderCloseGlyph()}
                <Glyphicon glyph="chevron-right" style={{margin: "auto", order: 1}}
                           onClick={() => this.props.onClickCloseOrPin(DrawerState.Hidden)}/>
            </div>
        );
    }

    public render() {
        const color = secondaryyBackground;

        return (
            <div style={{
                backgroundColor: "#efefef",
                opacity: this.props.isDocked ? 1.0 : 0.75,
                flexDirection: "column",
                flexWrap: "nowrap",
                alignItems: "flex-start",
                alignContent: "flex-start",
                order: 3,
                width: "400px",
                height: "100%",
                flexGrow: 0,
                flexShrink: 0,
                display: "flex",
                border: "1px solid"
            }}>
                {this.renderHeader()}
                <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                    <div style={{
                        backgroundColor: color,
                        color: "white",
                        height: "30px",
                        margin: 0,
                        padding: "6px"
                    }}>
                        <h5 style={{
                            color: "white",
                            margin: "auto",
                            paddingTop: "5px",
                            textAlign: "center"
                        }}>History</h5>
                    </div>
                    <BrainVolumesTable {...this.props}/>
                    <div style={{
                        backgroundColor: color,
                        color: "white",
                        height: "30px",
                        margin: 0,
                        padding: "6px"
                    }}>
                        <h5 style={{
                            color: "white",
                            margin: "auto",
                            paddingTop: "5px",
                            textAlign: "center"
                        }}>All Compartments</h5>
                    </div>
                    <BrainCompartmentSelectionTree {...this.props}/>
                </div>
            </div>
        );
    }
}
