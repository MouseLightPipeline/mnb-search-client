import * as React from "react";
import {observer} from "mobx-react-lite";
import {Button, Checkbox, List, Header, Icon} from "semantic-ui-react";
import {TomographyViewModelProps} from "./TomographyPanel";

const Slider = require("rc-slider");

const buttonIncrement = 25;

export const UserThreshold = observer<TomographyViewModelProps>(({tomography}) => {
    const thresholdViewModel = tomography.Threshold;

    return (
        <List.Item style={{paddingLeft: "12px", paddingBottom: "12px"}}>
            <List.Header>
                <div style={{display: "flex"}}>
                    <Checkbox toggle checked={thresholdViewModel.UseCustom} label="Custom Threshold" style={{flexGrow: 1}}
                              onChange={() => thresholdViewModel.UseCustom = !thresholdViewModel.UseCustom}/>
                    <Icon name="redo" size="small" style={{order: 1, paddingTop: "4px", paddingRight: "8px", visibility: thresholdViewModel.IsCustomThreshold ? "visible" : "hidden"}} onClick={()=> {thresholdViewModel.Current.Min = thresholdViewModel.ActualMin; thresholdViewModel.Current.Max = thresholdViewModel.ActualMax}}/>
                </div>
            </List.Header>
            {thresholdViewModel.UseCustom ?
                <List.Content style={{padding: "10px 18px 8px 8px"}}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <Button.Group size="mini">
                                <Button icon="angle left"
                                        onClick={() => thresholdViewModel.Current.Min = tomography.Threshold.Current.Min - buttonIncrement}/>
                                <Button icon="angle right"
                                        onClick={() => thresholdViewModel.Current.Min = tomography.Threshold.Current.Min + buttonIncrement}/>
                            </Button.Group>
                            <Slider.Range count={2} min={tomography.Threshold.CurrentSampleBounds.Min}
                                          max={tomography.Threshold.CurrentSampleBounds.Max}
                                          value={tomography.Threshold.Current.Values}
                                          style={{flexGrow: 1, order: 1, marginLeft: "8px", marginRight: "8px"}}
                                          onChange={(value: [number, number]) => {
                                              thresholdViewModel.Current.Min = value[0];
                                              thresholdViewModel.Current.Max = value[1];
                                          }}
                                          onAfterChange={(value: [number, number]) => {
                                              thresholdViewModel.Current.Min = value[0];
                                              thresholdViewModel.Current.Max = value[1];
                                          }}/>
                            <Button.Group size="mini" style={{order: 2}}>
                                <Button icon="angle left"
                                        onClick={() => thresholdViewModel.Current.Max = tomography.Threshold.Current.Max - buttonIncrement}/>
                                <Button icon="angle right"
                                        onClick={() => thresholdViewModel.Current.Max = tomography.Threshold.Current.Max + buttonIncrement}/>
                            </Button.Group>
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: "4px",
                            paddingRight: "2px"
                        }}>
                            <div style={{order: 0}}>
                                <Header as="h5">{tomography.Threshold.Current.Min}</Header>
                            </div>
                            <div style={{order: 1}}>
                                <Header as="h5">{tomography.Threshold.Current.Max}</Header>
                            </div>
                        </div>
                    </div>
                </List.Content> : null}
        </List.Item>
    );
});
