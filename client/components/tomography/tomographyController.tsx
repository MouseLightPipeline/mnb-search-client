import * as React from "react";
import {observer} from "mobx-react";
import {List, Checkbox} from "semantic-ui-react";

import {TomographyViewModel} from "../../viewmodel/tomographyViewModel";

export interface ISliceControllerProps {
    viewModel: TomographyViewModel;
}

export const TomographyController = observer((props: ISliceControllerProps) => {
    return (
        <List>
            <List.Item style={{paddingLeft: "12px"}}>
                <List.Header>
                    Sagittal
                </List.Header>
                <List.Content style={{paddingTop: "4px"}}>
                    <Checkbox toggle checked={props.viewModel.IsSagittalEnabled} onChange={() => props.viewModel.IsSagittalEnabled = !props.viewModel.IsSagittalEnabled}/>
                </List.Content>
            </List.Item>
            <List.Item style={{paddingLeft: "12px"}}>
                <List.Header>
                    Horizontal
                </List.Header>
                <List.Content style={{paddingTop: "4px"}}>
                    <Checkbox toggle checked={props.viewModel.IsHorizontalEnabled} onChange={() => props.viewModel.IsHorizontalEnabled = !props.viewModel.IsHorizontalEnabled}/>
                </List.Content>
            </List.Item>
            <List.Item style={{paddingLeft: "12px"}}>
                <List.Header>
                    Coronal
                </List.Header>
                <List.Content style={{paddingTop: "4px"}}>
                    <Checkbox toggle checked={props.viewModel.IsCoronalEnabled} onChange={() => props.viewModel.IsCoronalEnabled = !props.viewModel.IsCoronalEnabled}/>
                </List.Content>
            </List.Item>
        </List>
    );
});
