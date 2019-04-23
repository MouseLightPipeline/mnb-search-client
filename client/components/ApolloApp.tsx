import * as React from "react";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http";
import {ApolloProvider} from "react-apollo";

import {App} from "./page/App";
import {rootDataStore} from "../store/system/systemDataStore";
import {rootViewModel} from "../store/viewModel/systemViewModel";

const client = new ApolloClient({
    link: createHttpLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

const rootStoreContext = React.createContext(rootDataStore);

const rootViewModelContext = React.createContext(rootViewModel);

export const useStore = () => {
    return React.useContext(rootStoreContext)
};

export const useViewModel = () => {
    return React.useContext(rootViewModelContext)
};

export const ApolloApp = () => (
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
);
