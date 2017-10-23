import * as React from "react";
import {Button, Glyphicon} from "react-bootstrap";

import {headerButton, spinnerStyle} from "../../util/styles";


const styles = {
    toggle: {
        order: 1,
        padding: "4px"
    },
    message: {
        padding: "4px"
    }
};

export enum QueryStatus {
    NeverQueried,
    Loading,
    Loaded
}

export interface IQueryHeaderBaseProps {
    isCollapsed: boolean;
    status: QueryStatus;
    neuronSystemCount: number;
    neuronMatchCount: number;
    queryDuration: number;
    isPublicRelease: boolean;

    onToggleCollapsed(): void;
    onAddPredicate(evt: Event): void;
    onPerformQuery(evt: Event): void;
    onClearQuery(): void;
}

interface IQueryHeaderProps extends IQueryHeaderBaseProps {
}

interface IQueryHeaderState {
}

export class QueryHeader extends React.Component<IQueryHeaderProps, IQueryHeaderState> {
    private renderToggleButton() {
        if (this.props.status === QueryStatus.Loading) {
            return null;
        }

        return (
            <Button style={Object.assign({marginRight: "0px", marginLeft: "0px", marginTop: "1px"}, headerButton)} bsSize="sm"
                    onClick={(evt: any) => this.props.onClearQuery()}>
                <Glyphicon glyph="remove-circle" style={{paddingRight: "8px"}}/>
                Reset
            </Button>
        )
    }

    private renderMessage() {
        if (this.props.status === QueryStatus.NeverQueried) {
            if (this.props.isCollapsed) {
                return (
                    <div>
                        <Glyphicon glyph="fullscreen" style={styles.toggle}
                                   onClick={() => this.props.onToggleCollapsed()}/>
                        <span style={{paddingLeft: "6px"}}>Expand to perform a query</span>
                    </div>

                )
            } else {
                return null;
            }
        }

        if (this.props.status === QueryStatus.Loading) {
            return (
                <div>
                    <span style={{paddingRight: "8px"}}>
                            <div style={spinnerStyle}/>
                    </span>
                    Query in progress...
                </div>
            );
        } else {
            if (this.props.neuronSystemCount === 0) {
                return null;
            }

            const duration = (this.props.queryDuration / 1000);

            let matched = `Matched ${this.props.neuronMatchCount} of ${this.props.neuronSystemCount} neurons`;

            if (!this.props.isPublicRelease) {
                matched += ` in ${duration.toFixed(3)} ${duration === 1 ? "second" : "seconds"}`;
            }

            return (<span>{matched}</span>)
        }
    }

    private renderButtons() {
        return (
            <div>
                <Button style={Object.assign({marginRight: "20px"}, headerButton)} bsSize="sm"
                        disabled={this.props.status === QueryStatus.Loading}
                        onClick={(evt: any) => this.props.onAddPredicate(evt)}>
                    <Glyphicon glyph="plus" style={{paddingRight: "8px"}}/>
                    Add Filter
                </Button>
                <Button bsSize="sm" style={Object.assign({marginRight: "10px"}, headerButton)}
                        disabled={this.props.status === QueryStatus.Loading}
                        onClick={(evt: any) => this.props.onPerformQuery(evt)}>
                    <Glyphicon glyph="search" style={{paddingRight: "8px"}}/>Search
                </Button>
            </div>
        );
    }

    public render() {
        return (
            <div style={{
                backgroundColor: "rgb(5, 141, 150)",
                color: "white",
                height: "30px",
                minHeight: "40px",
                width: "100%",
                margin: 0,
                padding: "6px",
                display: "flex",
                order: 1,
                flexDirection: "row",
                verticalAlign: "middle"
            }}>
                <div style={{order: 1, flexGrow: 0, flexShrink: 0}}>
                    {this.renderToggleButton()}
                </div>
                <div style={{order: 2, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}>
                    <div style={styles.message}>
                        {this.renderMessage()}
                    </div>
                </div>
                <div style={{order: 3, flexGrow: 0, flexShrink: 0}}>
                    {this.renderButtons()}
                </div>
            </div>
        );
    }
}
