import * as React from "react";
import {observer} from "mobx-react";
import {List} from "semantic-ui-react";

import {TomographyViewModel} from "../../viewmodel/tomographyViewModel";
import {SliceControl} from "./sliceControl";
import {TomographyConstants} from "../../tomography/tomographyConstants";

const tomographyConstants = TomographyConstants.Instance;

export interface ITomographyControlsProps {
    viewModel: TomographyViewModel;
}

@observer
export class TomographyPanel extends React.Component<ITomographyControlsProps, {}> {
    public constructor(props: ITomographyControlsProps) {
        super(props);
    }

    public render() {
        return (
            <List divided relaxed>
                <SliceControl viewModel={this.props.viewModel.Sagittal} constants={tomographyConstants.Sagittal}/>
                <SliceControl viewModel={this.props.viewModel.Horizontal} constants={tomographyConstants.Horizontal}/>
                <SliceControl viewModel={this.props.viewModel.Coronal} constants={tomographyConstants.Coronal}/>
            </List>
        );
    }
}
