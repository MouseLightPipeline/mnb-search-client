import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Checkbox, List, Header} from "semantic-ui-react";
import {useViewModel} from "../ApolloApp";

const Slider = require("rc-slider");

const buttonIncrement = 25;

export const UserThreshold = observer(() => {

    const {Tomography} = useViewModel();

    const [threshold, setThreshold] = useState(Tomography.Threshold);

    const updateThreshold = (min, max) => {
        min = Math.max(min, 0);
        max = Math.min(max, 16384);
        setThreshold([min, max]);
        Tomography.Threshold = [min, max];
    };

    return (
        <List.Item style={{paddingLeft: "12px"}}>
            <List.Header>
                <div style={{display: "flex"}}>
                    <Checkbox toggle checked={Tomography.UseCustomThreshold} label="Custom Threshold"
                              onChange={() => Tomography.UseCustomThreshold = !Tomography.UseCustomThreshold}/>
                </div>
            </List.Header>
            {Tomography.UseCustomThreshold ?
                <List.Content style={{padding: "10px 18px 8px 8px"}}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <Button.Group size="mini">
                                <Button icon="angle left"
                                        onClick={() => updateThreshold(Tomography.Threshold[0] - buttonIncrement, Tomography.Threshold[1])}/>
                                <Button icon="angle right"
                                        onClick={() => updateThreshold(Tomography.Threshold[0] + buttonIncrement, Tomography.Threshold[1])}/>
                            </Button.Group>
                            <Slider.Range count={2} min={0} max={16384}
                                          value={threshold}
                                          style={{flexGrow: 1, order: 1, marginLeft: "8px", marginRight: "8px"}}
                                          onChange={(value: [number, number]) => setThreshold(value)}
                                          onAfterChange={(value: [number, number]) => Tomography.Threshold = value}/>
                            <Button.Group size="mini" style={{order: 2}}>
                                <Button icon="angle left"
                                        onClick={() => updateThreshold(Tomography.Threshold[0], Tomography.Threshold[1] - buttonIncrement)}/>
                                <Button icon="angle right"
                                        onClick={() => updateThreshold(Tomography.Threshold[0], Tomography.Threshold[1] + buttonIncrement)}/>
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
