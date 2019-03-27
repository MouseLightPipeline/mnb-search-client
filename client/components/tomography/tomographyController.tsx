import * as React from "react";
import {observer} from "mobx-react";
import {List, Checkbox} from "semantic-ui-react";

const Slider = require("rc-slider").default;

import {TomographyViewModel} from "../../viewmodel/tomographyViewModel";

export interface ITomographyControlsProps {
    viewModel: TomographyViewModel;
}

interface ITomographyControlsState {
    sagittalSliceLocation?: number;
    horizontalSliceLocation?: number;
    coronalSliceLocation?: number;
}

@observer
export class TomographyController extends React.Component<ITomographyControlsProps, ITomographyControlsState> {
    public constructor(props: ITomographyControlsProps) {
        super(props);

        this.state = {
            sagittalSliceLocation: props.viewModel.SagittalSliceLocation,
            horizontalSliceLocation: props.viewModel.HorizontalSliceLocation,
            coronalSliceLocation: props.viewModel.CoronalSliceLocation,
        }
    }

    public render() {
        return (
            <List>
                <List.Item style={{paddingLeft: "12px"}}>
                    <List.Header>
                        <Checkbox toggle checked={this.props.viewModel.IsSagittalEnabled} label="Sagittal"
                                  onChange={() => this.props.viewModel.IsSagittalEnabled = !this.props.viewModel.IsSagittalEnabled}/>
                    </List.Header>
                    {this.props.viewModel.IsSagittalEnabled ?
                        <List.Content style={{padding: "10px 18px 8px 8px"}}>
                            <Slider min={475} max={10900} step={25} value={this.state.sagittalSliceLocation}
                                    onChange={(value: number) => this.setState({sagittalSliceLocation: value})}
                                    onAfterChange={(value: number) => this.props.viewModel.SagittalSliceLocation = value}/>
                        </List.Content> : null}
                </List.Item>
                <List.Item style={{paddingLeft: "12px"}}>
                    <List.Header>
                        <Checkbox toggle checked={this.props.viewModel.IsHorizontalEnabled} label="Horizontal"
                                  onChange={() => this.props.viewModel.IsHorizontalEnabled = !this.props.viewModel.IsHorizontalEnabled}/>
                    </List.Header>
                    {this.props.viewModel.IsHorizontalEnabled ?
                        <List.Content style={{margin: "10px 18px 8px 8px"}}>
                            <Slider min={125} max={7700} step={25} value={this.state.horizontalSliceLocation}
                                    onChange={(value: number) => this.setState({horizontalSliceLocation: value})}
                                    onAfterChange={(value: number) => this.props.viewModel.HorizontalSliceLocation = value}/>
                        </List.Content> : null}
                </List.Item>
                <List.Item style={{paddingLeft: "12px"}}>
                    <List.Header>
                        <Checkbox toggle checked={this.props.viewModel.IsCoronalEnabled} label="Coronal"
                                  onChange={() => this.props.viewModel.IsCoronalEnabled = !this.props.viewModel.IsCoronalEnabled}/>
                    </List.Header>
                    {this.props.viewModel.IsCoronalEnabled ?
                        <List.Content style={{margin: "10px 18px 8px 8px"}}>
                            <Slider min={0} max={13250} step={25} value={this.state.coronalSliceLocation}
                                    onChange={(value: number) => this.setState({coronalSliceLocation: value})}
                                    onAfterChange={(value: number) => this.props.viewModel.CoronalSliceLocation = value}/>
                        </List.Content> : null}
                </List.Item>
            </List>
        );
    }
}

