import * as React from "react";
import {Glyphicon} from "react-bootstrap";

import {ITracingViewerProps, TracingViewer} from "./TracingViewer";
import {FetchState} from "./MainView";
import {primaryBackground} from "../../util/styles";

interface IViewerProps extends ITracingViewerProps {
    isQueryCollapsed: boolean;
    isNeuronListDocked: boolean;
    isCompartmentListDocked: boolean;
    isNeuronListOpen: boolean;
    isCompartmentListOpen: boolean;

    fetchState: FetchState;
    fetchCount: number;
    isRendering: boolean;

    onFloatNeuronList(): void;
    onFloatCompartmentList(): void;
    onToggleQueryCollapsed(): void;
    onSetFetchState(fetchState: FetchState): void;
    onCancelFetch(): void;
}

interface IViewerContainerState {
}

export class ViewerContainer extends React.Component<IViewerProps, IViewerContainerState> {

    private _tracingViewer;

    public constructor(props: IViewerProps) {
        super(props);

        this.state = {}
    }

    public get TracingViewer() {
        return this._tracingViewer;
    }

    private renderFloatNeuronListGlyph() {
        if (!this.props.isNeuronListDocked && !this.props.isNeuronListOpen) {
            return (
                <div style={{display: "flex", alignItems: "center", marginTop: "3px"}}>
                    <h5 style={{color: "white", fontWeight: "lighter", marginLeft: "10px", marginRight: "6px"}}>
                        Neurons</h5>
                    <Glyphicon glyph="chevron-right" style={{height: "100%", top: -1, order: 2}}
                               onClick={() => this.props.onFloatNeuronList()}/>
                </div>);
        } else {
            return null;
        }
    }

    private renderFloatCompartmentListGlyph() {
        if (!this.props.isCompartmentListDocked && !this.props.isCompartmentListOpen) {
            return (
                <div style={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: "3px"}}>
                    <Glyphicon glyph="chevron-left" style={{height: "100%", order: 1, top: -1}}
                               onClick={() => this.props.onFloatCompartmentList()}/>
                    <h5 style={{color: "white", fontWeight: "lighter", marginLeft: "6px", marginRight: "10px", order: 2}}>
                        Compartments</h5>
                </div>);
        } else {
            return null;
        }
    }

    private renderCollapseQueryGlyph() {
        return (<Glyphicon glyph={this.props.isQueryCollapsed ? "chevron-down" : "chevron-up"}
                           style={{margin: "auto", marginRight: "10px", order: 3}}
                           onClick={() => this.props.onToggleQueryCollapsed()}/>)
    }

    private renderProgress() {
        if ((this.props.fetchCount > 0 && this.props.fetchState === FetchState.Running) || this.props.isRendering) {
            return (<div style={spinnerStyle}/>);
        }

        return null;
    }

    private renderMessage() {
        const isPaused = this.props.fetchState === FetchState.Paused;

        if (this.props.fetchCount > 0) {
            const glyph = isPaused ? "play" : "pause";

            return (
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <div style={{
                        flex: "", marginLeft: "10px", height: "100%", color: "white"
                    }}>
                        {`Fetching neuron tracings ( ${this.props.fetchCount} remaining ${isPaused ? "- paused" : ""})`}
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
                            <Glyphicon glyph={glyph}
                                       style={{paddingTop: "2px", paddingBottom: "0px", paddingLeft: "1px"}}
                                       onClick={() => this.props.onSetFetchState(isPaused ? FetchState.Running : FetchState.Paused)}/>
                        </div>
                        <div style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            height: "100%",
                            border: "1px solid #ccc", marginLeft: "10px",
                            padding: "0px 10px"
                        }}>
                            <Glyphicon glyph="remove"
                                       style={{paddingTop: "2px", paddingBottom: "0px", paddingLeft: "1px"}}
                                       onClick={() => this.props.onCancelFetch()}/>
                        </div>
                    </div>
                </div>
            );
        }

        if (this.props.isRendering) {
            return (
                <div>
                    <span style={{color: "white"}}>
                        Submitting tracing content for render...
                    </span>
                </div>
            );
        }

    }

    private renderHeader() {
        const isLeftGlyphVisible = !this.props.isNeuronListDocked && !this.props.isNeuronListOpen;
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
                        {this.renderFloatNeuronListGlyph()}
                    </div>
                    <div style={{display: "flex", flexDirection: "column", flex: "1 1 auto", order: 2, width: "100%"}}>
                        <div style={{flex: "0 0 auto", order: 1, textAlign: "center", height: "15px"}}>
                            {this.renderCollapseQueryGlyph()}
                        </div>
                        <div style={{display: "flex", flexDirection: "row", flex: "1 1 auto", order: 2}}>
                            <div style={{
                                flex: "0 0 auto",
                                order: 1,
                                marginRight: "6px",
                                marginLeft: progressMarginLeft
                            }}>
                                {this.renderProgress()}
                            </div>
                            <div style={{flex: "1 1 auto", margin: "auto", order: 2, textAlign: "left"}}>
                                {this.renderMessage()}
                            </div>
                        </div>
                    </div>
                    <div style={{flex: "0 0 auto", order: 3, width: "auto"}}>
                        {this.renderFloatCompartmentListGlyph()}
                    </div>
                </div>
            </div>
        );
    }

    public render() {

        return (
            <div style={{
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
                {this.renderHeader()}
                <div style={{order: 2, flexGrow: 1, width: "100%", height: "100%"}}>
                    <TracingViewer {...this.props} ref={(t => this._tracingViewer = t)}/>
                </div>
            </div>
        );
    }
}

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
