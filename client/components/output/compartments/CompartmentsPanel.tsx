import * as React from "react";
import {observer} from "mobx-react-lite";
import {Icon} from "semantic-ui-react";

import {CompartmentHistory} from "./CompartmentHistory";
import {primaryBackground, secondaryBackground} from "../../../util/styles";
import {TomographyControls} from "../../tomography/tomographyPanel";
import {useViewModel} from "../../app/App";
import {CompartmentTree} from "./CompartmentTree";
import {DrawerState} from "../../../store/viewModel/layout/DockableDrawerViewModel";
import {useLayout} from "../../../hooks/useLayout";

const CompartmentHeader = observer(() => {
    const {CompartmentsDrawer} = useLayout();

    const transform = CompartmentsDrawer.DrawerState === DrawerState.Dock ? "" : "rotate(-45deg)";

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
                  onClick={() => CompartmentsDrawer.toggleDocked()}/>
            <Icon name="chevron right" style={{margin: "auto", order: 1}}
                  onClick={() => CompartmentsDrawer.DrawerState = DrawerState.Hidden}/>
        </div>
    );
});

export const CompartmentsPanel = observer(() => {
    const {CompartmentsDrawer} = useLayout();

    const {Tomography, Compartments} = useViewModel();

    const color = secondaryBackground;

    return (
        <div id="compartmentsPanel" style={{
            backgroundColor: "#efefef",
            opacity: CompartmentsDrawer.DrawerState === DrawerState.Dock ? 1.0 : 0.75,
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
            <CompartmentHeader/>
            <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                <TomographyControls tomography={Tomography}/>
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
                    <Icon style={{order: 1, flexGrow: 0, verticalAlign: "middle"}}
                          name={Compartments.History.IsVisible ? "angle up" : "angle down"}
                          onClick={() => Compartments.History.IsVisible = !Compartments.History.IsVisible}/>
                </div>
                {Compartments.History.IsVisible ? <CompartmentHistory/> : null}
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
                <CompartmentTree/>
            </div>
        </div>
    );
});
