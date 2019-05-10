import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Checkbox, List, Header} from "semantic-ui-react";
import {useViewModel} from "../app/App";

const Slider = require("rc-slider");

const buttonIncrement = 25;

export const UserThreshold = observer(() => {

    const {Tomography} = useViewModel();

    const thresholdViewModel = Tomography.Threshold;

    const [threshold, setThreshold] = useState(Tomography.Threshold.Current);

    const updateThreshold = (min, max) => {
        min = Math.max(min, 0);
        max = Math.min(max, 16384);
        setThreshold([min, max]);
        thresholdViewModel.Current = [min, max];
    };

    return (
        <List.Item style={{paddingLeft: "12px"}}>
            <List.Header>
                <div style={{display: "flex"}}>
                    <Checkbox toggle checked={thresholdViewModel.UseCustom} label="Custom Threshold"
                              onChange={() => thresholdViewModel.UseCustom = !thresholdViewModel.UseCustom}/>
                </div>
            </List.Header>
            {thresholdViewModel.UseCustom ?
                <List.Content style={{padding: "10px 18px 8px 8px"}}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <Button.Group size="mini">
                                <Button icon="angle left"
                                        onClick={() => updateThreshold(Tomography.Threshold.Current[0] - buttonIncrement, Tomography.Threshold.Current[1])}/>
                                <Button icon="angle right"
                                        onClick={() => updateThreshold(Tomography.Threshold.Current[0] + buttonIncrement, Tomography.Threshold.Current[1])}/>
                            </Button.Group>
                            <Slider.Range count={2} min={0} max={16384}
                                          value={threshold}
                                          style={{flexGrow: 1, order: 1, marginLeft: "8px", marginRight: "8px"}}
                                          onChange={(value: [number, number]) => setThreshold(value)}
                                          onAfterChange={(value: [number, number]) => thresholdViewModel.Current = value}/>
                            <Button.Group size="mini" style={{order: 2}}>
                                <Button icon="angle left"
                                        onClick={() => updateThreshold(Tomography.Threshold.Current[0], Tomography.Threshold.Current[1] - buttonIncrement)}/>
                                <Button icon="angle right"
                                        onClick={() => updateThreshold(Tomography.Threshold.Current[0], Tomography.Threshold.Current[1] + buttonIncrement)}/>
                            </Button.Group>
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: "4px",
                            paddingRight: "2px"
                        }}>
                            <div style={{order: 0}}>
                                <Header as="h5">{threshold[0]}</Header>
                            </div>
                            <div style={{order: 1}}>
                                <Header as="h5">{threshold[1]}</Header>
                            </div>
                        </div>
                    </div>
                </List.Content> : null}
        </List.Item>
    );
});
