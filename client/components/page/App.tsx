import * as React from "react";
import {observer} from "mobx-react-lite";
import {Message} from "semantic-ui-react";

import {Content} from "./Content";
import {NdbConstants} from "../../models/constants";
import {CONSTANTS_QUERY, ConstantsQuery} from "../../graphql/constants";
import {useLoadSystemConfiguration} from "../../hooks/useLoadSystemConfiguration";
import {useStore} from "../ApolloApp";

export const App = observer(() => {
    useLoadSystemConfiguration();

    const {systemConfiguration} = useStore();

    if (systemConfiguration.searchScope === null) {
        return <Loading/>;
    }

    return (
        <ConstantsQuery query={CONSTANTS_QUERY} variables={{searchScope: systemConfiguration.searchScope}}>
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

                return <Content constants={NdbConstants.DefaultConstants} searchScope={systemConfiguration.searchScope}
                                systemVersion={systemConfiguration.systemVersion} exportLimit={systemConfiguration.exportLimit}/>;
            }}
        </ConstantsQuery>
    );

});

const Loading = () => {
    return (
        <div style={{textAlign: "center", fontSize: "20px", width: "100%"}}>
            <div style={{padding: "20px"}}>
                initializing
            </div>
            <div style={{padding: "20px"}}>
                <div style={spinnerStyle}/>
            </div>
        </div>
    );
};

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