import * as React from "react";
import {observer} from "mobx-react-lite";
import {Icon} from "semantic-ui-react";

import {BrainCompartmentSelectionTree, IBrainAreaGeometryProps} from "./BrainCompartmentSelectionTree";
import {BrainVolumesTable, IBrainVolumesTableProps} from "./BrainCompartmentViewHistoryList";
import {DrawerState} from "../MainView";
import {primaryBackground, secondaryBackground} from "../../../util/styles";
import {TomographyPanel} from "../../tomography/tomographyPanel";
import {useViewModel} from "../../app/App";

type CompartmentHeaderProps = {
    isDocked: boolean;

    onClickCloseOrPin(state: DrawerState): void;
}

const CompartmentHeader = (props: CompartmentHeaderProps) => {
    const transform = props.isDocked ? "" : "rotate(-45deg)";
    const state = props.isDocked ? DrawerState.Float : DrawerState.Dock;

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
            <h4 style={{
                color: "white",
                fontWeight: "lighter",
                margin: "auto",
                marginRight: "33px",
                textAlign: "center",
                flexGrow: 1,
                order: 3
            }}>Compartments</h4>
            <Icon name="pin" style={{margin: "auto", order: 2, marginLeft: "10px", transform: transform}}
                  onClick={() => props.onClickCloseOrPin(state)}/>
            <Icon name="chevron right" style={{margin: "auto", order: 1}}
                  onClick={() => props.onClickCloseOrPin(DrawerState.Hidden)}/>
        </div>
    );
};

interface ICompartmentListContainerProps extends IBrainVolumesTableProps, IBrainAreaGeometryProps {
    isDocked: boolean;

    onClickCloseOrPin(state: DrawerState): void;
}

export const CompartmentListContainer = observer((props: ICompartmentListContainerProps) => {
    const color = secondaryBackground;

    const {Tomography, CompartmentHistory} = useViewModel();

    return (
        <div style={{
            backgroundColor: "#efefef",
            opacity: props.isDocked ? 1.0 : 0.75,
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
            <CompartmentHeader {...props}/>
            <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                <div style={{
                    display: "flex",
                    backgroundColor: "#00a450",
                    color: "white",
                    height: "30px",
                    margin: 0,
                    padding: "6px"
                }}>
                    <Icon style={{order: 0, flexGrow: 0, verticalAlign: "middle", paddingTop: "2px"}} size="small" name="undo" onClick={() => Tomography.Sample = null}/>
                    <h5 style={{
                        color: "white",
                        margin: "auto",
                        textAlign: "center",
                        order: 1,
                        flexGrow: 1
                    }}>{`Tomography - ${Tomography.Sample ? `Sample ${Tomography.Sample.idNumber}` : "Reference"}`}</h5>
                    <Icon style={{order: 2, flexGrow: 0, verticalAlign: "middle"}} name={Tomography.IsVisible ? "angle up" : "angle down"} onClick={() => Tomography.IsVisible = !Tomography.IsVisible}/>
                </div>
                {Tomography.IsVisible ? <TomographyPanel/> : null}
                <div style={{
                    display: "flex",
                    backgroundColor: color,
                    color: "white",
                    height: "30px",
                    margin: 0,
                    padding: "6px"
                }}>
                    <h5 style={{
                        color: "white",
                        margin: "auto",
                        textAlign: "center",
                        order: 0,
                        flexGrow: 1
                    }}>History</h5>
                    <Icon style={{order: 1, flexGrow: 0, verticalAlign: "middle"}} name={CompartmentHistory.IsVisible ? "angle up" : "angle down"} onClick={() => CompartmentHistory.IsVisible = !CompartmentHistory.IsVisible}/>
                </div>
                {CompartmentHistory.IsVisible ? <BrainVolumesTable {...props}/> : null}
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
                        textAlign: "center"
                    }}>All Compartments</h5>
                </div>
                <BrainCompartmentSelectionTree {...props}/>
            </div>
        </div>
    );
});
