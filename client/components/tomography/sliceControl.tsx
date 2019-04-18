import {observer} from "mobx-react";
import * as React from "react";
import {Button, Checkbox, List} from "semantic-ui-react";

const Slider = require("rc-slider").default;

import {SliceControlViewModel} from "../../viewmodel/tomographyViewModel";
import {TomographyPlaneConstants} from "../../tomography/tomographyConstants";

const sliceMovementStep = 25;

export interface ISliceControlProps {
    viewModel: SliceControlViewModel;
    constants: TomographyPlaneConstants;
}

interface ISliceControlState {
    location?: number;
}

@observer
export class SliceControl extends React.Component<ISliceControlProps, ISliceControlState> {
    public constructor(props: ISliceControlProps) {
        super(props);

        this.state = {
            location: props.viewModel.Location
        }
    }

    public render() {
        return (
            <List.Item style={{paddingLeft: "12px"}}>
                <List.Header>
                    <div style={{display: "flex"}}>
                        <Checkbox toggle checked={this.props.viewModel.IsEnabled} label={this.props.constants.Name}
                                  onChange={() => this.props.viewModel.IsEnabled = !this.props.viewModel.IsEnabled}/>
                        <div style={{
                            flexGrow: 1,
                            textAlign: "right",
                            visibility: this.props.viewModel.IsEnabled ? "visible" : "hidden",
                            paddingRight: "10px"
                        }}>
                            {`${(this.props.viewModel.Location / 1000).toFixed(2)} mm`}
                        </div>
                    </div>
                </List.Header>
                {this.props.viewModel.IsEnabled ?
                    <List.Content style={{padding: "10px 18px 8px 8px"}}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <Button size="mini" icon="angle left"
                                    onClick={() => this.props.viewModel.Location = Math.min(Math.max(this.props.viewModel.Location - sliceMovementStep, this.props.constants.Min), this.props.constants.Max)}/>
                            <Slider min={this.props.constants.Min} max={this.props.constants.Max}
                                    step={sliceMovementStep}
                                    value={this.state.location}
                                    style={{flexGrow: 1, order: 1, marginLeft: "4px", marginRight: "8px"}}
                                    onChange={(value: number) => this.setState({location: value})}
                                    onAfterChange={(value: number) => this.props.viewModel.Location = value}/>
                            <Button size="mini" icon="angle right" style={{order: 2}}
                                    onClick={() => this.props.viewModel.Location = Math.min(Math.max(this.props.viewModel.Location + sliceMovementStep, this.props.constants.Min), this.props.constants.Max)}/>
                        </div>
                    </List.Content> : null}
            </List.Item>
        );
    }
}
