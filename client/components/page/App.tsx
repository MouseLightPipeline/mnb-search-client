import * as React from "react";
import {Message} from "semantic-ui-react";

import {Content} from "./Content";
import {NdbConstants} from "../../models/constants";
import {CONSTANTS_QUERY, ConstantsQuery} from "../../graphql/constants";
import {SearchScope} from "../../models/uiQueryPredicate";

export type IAppState = {
    searchScope?: SearchScope;
    systemVersion?: string;
    exportLimit?: number;
}

export class App extends React.Component<{}, IAppState> {
    public constructor(props: {}) {
        super(props);

        this.state = {
            searchScope: null,
            systemVersion: null,
            exportLimit: 20
        };

        fetch('/system', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (resp) => {
            try {
                if (resp.status === 200) {
                    const data = await resp.json();

                    this.setState({
                        searchScope: data.searchScope,
                        systemVersion: data.systemVersion,
                        exportLimit: data.exportLimit
                    })
                } else {
                    console.log(resp);
                }
            } catch (err) {
                console.log(err);
            }
        });
    }

    public render() {
        if (this.state.searchScope === null) {
            return <Loading/>;
        }

        return (
            <ConstantsQuery query={CONSTANTS_QUERY} variables={{searchScope: this.state.searchScope}}>
                {({loading, error, data}) => {
                    if (loading) {
                        return <Loading/>;
                    }

                    if (error) {
                        console.log(error);
                        return (
                            <div style={{padding: "20px"}}>
                                <Message negative icon="exclamation triangle" header="Service not responding"
                                         content="System data could not be loaded.  Will attempt again shortly."/>
                            </div>
                        );
                    }

                    NdbConstants.DefaultConstants.load(data);

                    return <Content constants={NdbConstants.DefaultConstants} {...this.state}/>;
                }}
            </ConstantsQuery>
        );
    }
}

const Loading = () => {
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
};

