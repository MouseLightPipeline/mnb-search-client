import * as React from "react";

export const Footer = () => {
    return (
        <div className="container-fluid footer" style={{
            display: "flex",
            order: 1,
            flexDirection: "row",
            verticalAlign: "middle"}}>
            <div style={{verticalAlign: "middle", color: "white", order: 1, flexGrow: 0, flexShrink: 0}}>
                MouseLight Neuron Browser Copyright © 2016 - 2018 Howard Hughes Medical Institute
            </div>
            <div style={{order: 2, flexGrow: 1, flexShrink: 1, marginLeft: "10px"}}/>
            <div style={{verticalAlign: "middle", color: "white", order: 3, flexGrow: 0, flexShrink: 0}}>502 neurons available, last updated July 8, 2018</div>
        </div>
    )
};
