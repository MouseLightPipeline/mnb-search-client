import * as React from "react";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "react-apollo-hooks";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http";

import {AppSystemConfiguration} from "./AppSystemConfiguration";
import {AppConstants} from "./AppConstants";
import {AppContent} from "./AppContent";
import {AppTomography} from "./AppTomography";

const client = new ApolloClient({
    link: createHttpLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

/**
 * Enable Apollo GraphQL in downstream components.  The stack of AppXYZ components between the Apollo components and
 * `AppContent` ensure that all required data is loaded before rendering the actual application components. `AppContent`
 * and below can assume that data is available.
 */
export const ApolloApp = () => (
    <ApolloHooksProvider client={client}>
        <ApolloProvider client={client}>
            <AppSystemConfiguration>
                <AppConstants>
                    <AppTomography>
                        <AppContent/>
                    </AppTomography>
                </AppConstants>
            </AppSystemConfiguration>
        </ApolloProvider>
    </ApolloHooksProvider>
);
