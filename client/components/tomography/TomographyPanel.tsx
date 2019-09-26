import * as React from "react";
import {Icon, List} from "semantic-ui-react";
import {observer} from "mobx-react-lite";

import {SliceControl} from "./SliceControl";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {UserThreshold} from "./UserThreshold";
import {TomographyViewModel} from "../../store/viewModel/tomographyViewModel";

const tomographyConstants = TomographyConstants.Instance;

export type TomographyViewModelProps = {
    tomography: TomographyViewModel;
}

export const TomographyControls = observer<TomographyViewModelProps>(({tomography}) => {
    return (
        <div>
            <TomographyHeader tomography={tomography}/>
            {tomography.AreControlsVisible ? <TomographyPanel tomography={tomography}/> : null}
        </div>
    )
});

const TomographyPanel = observer<TomographyViewModelProps>(({tomography}) => {
    return (
        <List divided relaxed>
            <SliceControl viewModel={tomography.Sagittal} constants={tomographyConstants.Sagittal}/>
            <SliceControl viewModel={tomography.Horizontal} constants={tomographyConstants.Horizontal}/>
            <SliceControl viewModel={tomography.Coronal} constants={tomographyConstants.Coronal}/>
            <UserThreshold tomography={tomography}/>
        </List>
    );
});

const TomographySwapSampleButton = observer<TomographyViewModelProps>(({tomography}) => {
    const style = {
        order: 0,
        flexGrow: 0,
        verticalAlign: "middle",
        paddingTop: "2px",
        visibility: tomography.CanSwapSample ? "visible" : "hidden"
    };

    return (<Icon style={style} size="small" name={tomography.IsReferenceSample ? "redo" : "undo"}
                  onClick={() => tomography.swapSample()}/>)
});

const TomographyHeader = observer<TomographyViewModelProps>(({tomography}) => {
    return (
        <div style={HeaderContainerStyle}>
            <TomographySwapSampleButton tomography={tomography}/>
            <h5 style={HeaderStyle}>{`Tomography - ${tomography.Sample ? `Sample ${tomography.Sample.idNumber}` : "Reference"}`}</h5>
            <Icon style={{order: 2, flexGrow: 0, verticalAlign: "middle"}}
                  name={tomography.AreControlsVisible ? "angle up" : "angle down"}
                  onClick={() => tomography.AreControlsVisible = !tomography.AreControlsVisible}/>
        </div>)
});


const HeaderContainerStyle = {
    display: "flex",
    backgroundColor: "#00a450",
    color: "white",
    height: "30px",
    margin: 0,
    padding: "6px"
};

const HeaderStyle = {
    color: "white",
    margin: "auto",
    textAlign: "center" as "center",
    order: 1,
    flexGrow: 1
};