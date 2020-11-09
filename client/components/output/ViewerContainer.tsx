import * as React from "react";

import {FetchState} from "./MainView";
import {primaryBackground} from "../../util/styles";
import {Icon} from "semantic-ui-react";
import {TracingViewerWrapper, TracingWrapperProps} from "./TracingViewerWrapper";
import {observer} from "mobx-react-lite";
import {useLayout} from "../../hooks/useLayout";
import {DrawerState} from "../../store/viewModel/layout/DockableDrawerViewModel";

export type IViewerProps = TracingWrapperProps & {
    isQueryCollapsed: boolean;

    fetchState: FetchState;
    fetchCount: number;
    isRendering: boolean;

    onToggleQueryCollapsed(): void;
    onSetFetchState(fetchState: FetchState): void;
    onCancelFetch(): void;
}

export const ViewerContainer = (props: IViewerProps) => {
        return (
            <div id="viewerContainer" style={{
                flexDirection: "column",
                flexWrap: "nowrap",
                alignItems: "flex-start",
                alignContent: "flex-start",
                order: 2,
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 0,
                display: "flex",
                height: "100%",
                minWidth: "200px",
                borderTop: "1px solid",
                borderBottom: "1px solid"
            }}>
                <ViewerPanelHeader {...props}/>
                <div style={{order: 2, flexGrow: 1, width: "100%", height: "100%"}}>
                    <TracingViewerWrapper {...props}/>
                </div>
            </div>
        );
};

const ViewerPanelHeader = observer((props: IViewerProps) => {
    const {NeuronsDrawer} = useLayout();

    const isLeftGlyphVisible = NeuronsDrawer.DrawerState === DrawerState.Hidden;

    const progressMarginLeft = isLeftGlyphVisible ? "20px" : "0px";

    return (
        <div style={{
            backgroundColor: primaryBackground,
            color: "white",
            height: "40px",
            minHeight: "40px",
            width: "100%",
            margin: "auto",
            padding: "0px",
            display: "flex",
            order: 1,
            flexDirection: "row"
        }}>
            <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                <div style={{flex: "0 0 auto", order: 1, width: "auto"}}>
                    <FloatNeuronListGlyph/>
                </div>
                <div style={{display: "flex", flexDirection: "column", flex: "1 1 auto", order: 2, width: "100%"}}>
                    <div style={{flex: "0 0 auto", order: 1, textAlign: "center", height: "15px"}}>
                        <CollapseQueryGlyph {...props}/>
                    </div>
                    <div style={{display: "flex", flexDirection: "row", flex: "1 1 auto", order: 2}}>
                        <div style={{
                            flex: "0 0 auto",
                            order: 1,
                            marginRight: "6px",
                            marginLeft: progressMarginLeft
                        }}>
                            <FetchProgress {...props}/>
                        </div>
                        <div style={{flex: "1 1 auto", margin: "auto", order: 2, textAlign: "left"}}>
                            <FetchMessage {...props}/>
                        </div>
                    </div>
                    <div style={{flex: "1 1 auto", order: 2, textAlign: "center", width: "100%"}}>
                        {props.isQueryCollapsed ?
                            <span onClick={() => props.onToggleQueryCollapsed()}>
                                    Show Search
                                </span> : null}
                    </div>
                </div>
                <div style={{flex: "0 0 auto", order: 3, width: "auto"}}>
                    <FloatCompartmentListGlyph/>
                </div>
            </div>
        </div>
    );
});

type CollapseQueryGlyphProps = {
    isQueryCollapsed: boolean;
    onToggleQueryCollapsed(): void;
}

const CollapseQueryGlyph = (props: CollapseQueryGlyphProps) => {
    return (<Icon name={props.isQueryCollapsed ? "chevron down" : "chevron up"}
                  style={{margin: "auto", order: 3}}
                  onClick={() => props.onToggleQueryCollapsed()}/>)
};

type FetchProgressProps = {
    fetchState: FetchState;
    fetchCount: number;
    isRendering: boolean;
}

const FetchProgress = (props: FetchProgressProps) => {
    if ((props.fetchCount > 0 && props.fetchState === FetchState.Running) || props.isRendering) {
        return (<div style={spinnerStyle}/>);
    }

    return null;
};

type FetchMessageProps = {
    fetchState: FetchState;
    fetchCount: number;
    isRendering: boolean;

    onSetFetchState(fetchState: FetchState): void;
    onCancelFetch(): void;
}

const FetchMessage = (props: FetchMessageProps) => {
    const isPaused = props.fetchState === FetchState.Paused;

    if (props.fetchCount > 0) {
        const iconName = isPaused ? "play" : "pause";

        return (
            <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <div style={{
                    flex: "", marginLeft: "10px", height: "100%", color: "white"
                }}>
                    {`Fetching neuron tracings ( ${props.fetchCount} remaining ${isPaused ? "- paused" : ""})`}
                </div>
                <div style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    height: "100%",
                    color: "white",
                    marginLeft: "10px"
                }}>
                    <div style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        height: "100%",
                        border: "1px solid #ccc",
                        padding: "0px 10px"
                    }}>
                        <Icon name={iconName}
                              style={{paddingTop: "2px", paddingBottom: "0px", paddingLeft: "1px"}}
                              onClick={() => props.onSetFetchState(isPaused ? FetchState.Running : FetchState.Paused)}/>
                    </div>
                    <div style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        height: "100%",
                        border: "1px solid #ccc", marginLeft: "10px",
                        padding: "0px 10px"
                    }}>
                        <Icon name="remove"
                              style={{paddingTop: "2px", paddingBottom: "0px", paddingLeft: "1px"}}
                              onClick={() => props.onCancelFetch()}/>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }

    if (props.isRendering) {
        return (
            <div>
                    <span style={{color: "white"}}>
                        Submitting tracing content for render...
                    </span>
            </div>
        );
    }

};

const FloatCompartmentListGlyph = observer(() => {
    const {CompartmentsDrawer} = useLayout();

    if (CompartmentsDrawer.DrawerState === DrawerState.Hidden) {
        return (
            <div style={{display: "flex", alignItems: "center", height: "100%"}}
                 onClick={() => CompartmentsDrawer.DrawerState = DrawerState.Float}>
                <Icon name="chevron left" style={{order: 1, top: -1}}/>
                <h5 style={{
                    color: "white",
                    fontWeight: "lighter",
                    margin: "0 6px 0 10px",
                    order: 2
                }}>
                    Compartments</h5>
            </div>);
    } else {
        return null;
    }
});


const FloatNeuronListGlyph = observer(() => {
    const {NeuronsDrawer} = useLayout();

    if (NeuronsDrawer.DrawerState === DrawerState.Hidden) {
        return (
            <div style={{display: "flex", alignItems: "center", height: "100%"}}
                 onClick={() => NeuronsDrawer.DrawerState = DrawerState.Float}>
                <h5 style={{color: "white", fontWeight: "lighter", margin: "0 6px 0 10px"}}>
                    Neurons</h5>
                <Icon name="chevron right" style={{top: -1, order: 2}}
                />
            </div>);
    } else {
        return null;
    }
});

const spinnerStyle = {
    width: 20,
    height: 20,
    border: "3px solid",
    borderColor: "white",
    borderBottomColor: "transparent",
    borderRadius: "100%",
    background: "transparent !important",
    verticalAlign: "middle",
    animation: "spinner 0.75s 0s infinite linear",
    animationFillMode: 'both',
    display: "inline-block",
};
