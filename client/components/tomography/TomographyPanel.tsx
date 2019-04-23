import * as React from "react";
import {List} from "semantic-ui-react";
import {observer} from "mobx-react-lite";

import {SliceControl} from "./sliceControl";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {useViewModel} from "../ApolloApp";

const tomographyConstants = TomographyConstants.Instance;

export const TomographyPanel = observer(() => {
    const {tomography} = useViewModel();

    return (
        <List divided relaxed>
            <SliceControl viewModel={tomography.Sagittal} constants={tomographyConstants.Sagittal}/>
            <SliceControl viewModel={tomography.Horizontal} constants={tomographyConstants.Horizontal}/>
            <SliceControl viewModel={tomography.Coronal} constants={tomographyConstants.Coronal}/>
        </List>
    );
});
