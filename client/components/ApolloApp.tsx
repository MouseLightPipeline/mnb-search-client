import * as React from "react";
import {ApolloProvider, ApolloClient} from "react-apollo";
import {createNetworkInterface} from "apollo-client";

import {AppWithData} from "./page/App";

declare let window: { __APOLLO_STATE__: any, location: any };

const networkInterface = createNetworkInterface({
    uri: "/graphql"
});

const client = new ApolloClient({
    networkInterface: networkInterface,
    addTypename: true,
    dataIdFromObject: (result: any) => {
        if (result.id) {
            return result.__typename + result.id;
        }
        return null;
    },
    initialState: window.__APOLLO_STATE__,
    connectToDevTools: true
});

export const ApolloApp = () => (
    <ApolloProvider client={client}>
        <AppWithData/>
    </ApolloProvider>
);
