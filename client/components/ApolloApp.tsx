import * as React from "react";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http";
import {ApolloProvider} from "react-apollo";

import {App} from "./page/App";

const client = new ApolloClient({
    link: createHttpLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

export const ApolloApp = () => (
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
);