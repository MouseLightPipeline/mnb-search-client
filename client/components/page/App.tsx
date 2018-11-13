import * as React from "react";
import {Message} from "semantic-ui-react";

import {Content} from "./Content";
import {NdbConstants} from "../../models/constants";
import {CONSTANTS_QUERY, ConstantsQuery} from "../../graphql/constants";

export class App extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);

        this.state = {
            isSettingsOpen: false,
            queryFilters: []
        };

        fetch('/system', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (resp) => {
            try {
                const data = await resp.json();

                NdbConstants.DefaultConstants.ClientVersion = data.version;
            } catch (err) {
                console.log(err);
            }
        });
    }

    public render() {

        return (
            <ConstantsQuery query={CONSTANTS_QUERY}>
                {({loading, error, data}) => {
                    if (loading) {
                        const spinnerStyle = {
                            width: 40,
                            height: 40,
                            border: "2px solid",
                            borderColor: "#1e8fc6",
                            borderBottomColor: "transparent",
                            borderRadius: "100%",
                            background: "transparent !important",
                            verticalAlign: "middle",
                            animation: "spinner 0.75s 0s infinite linear",
                            animationFillMode: 'both',
                            display: "inline-block"
                        };

                        return (
                            <div>
                                <div style={{textAlign: "center", fontSize: "20px", width: "100%", padding: "20px"}}>
                                    initializing
                                </div>
                                <div style={{textAlign: "center", fontSize: "20px", width: "100%", padding: "20px"}}>
                                    <div style={spinnerStyle}/>
                                </div>
                            </div>
                        );
                    }

                    if (error) {
                        console.log(error);
                        return (
                            <Message negative icon="exclamation triangle" header="Service not responding"
                                     content="System data could not be loaded.  Will attempt again shortly."/>
                        );
                    }

                    NdbConstants.DefaultConstants.load(data);

                    return <Content constants={NdbConstants.DefaultConstants}/>;
                }}
            </ConstantsQuery>
        );
    }
}

