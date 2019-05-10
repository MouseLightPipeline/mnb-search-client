import * as React from "react";
import {List} from "semantic-ui-react";
import {observer} from "mobx-react-lite";

import {SliceControl} from "./SliceControl";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {useViewModel} from "../app/App";
import {UserThreshold} from "./UserThreshold";

const tomographyConstants = TomographyConstants.Instance;

export const TomographyPanel = observer(() => {
    const {Tomography} = useViewModel();

    return (
        <List divided relaxed>
            <SliceControl viewModel={Tomography.Sagittal} constants={tomographyConstants.Sagittal}/>
            <SliceControl viewModel={Tomography.Horizontal} constants={tomographyConstants.Horizontal}/>
            <SliceControl viewModel={Tomography.Coronal} constants={tomographyConstants.Coronal}/>
            <UserThreshold/>
        </List>
    );
});
