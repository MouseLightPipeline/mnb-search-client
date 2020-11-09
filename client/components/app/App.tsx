import * as React from "react";

import {SystemDataStore} from "../../store/system/systemDataStore";
import {setRootViewModel, SystemViewModel} from "../../store/viewModel/systemViewModel";
import {ApolloApp} from "./ApolloApp";

const rootDataStore = new SystemDataStore();
const rootStoreContext = React.createContext(rootDataStore);

// TODO Don't set this when it is removed.
const viewModel = new SystemViewModel(rootDataStore);
setRootViewModel(viewModel);

const rootViewModelContext = React.createContext(viewModel);

export const useStore = () => {
    return React.useContext(rootStoreContext)
};

export const useViewModel = () => {
    return React.useContext(rootViewModelContext)
};

/**
 * Top-level component.
 *
 * @constructor
 */
export const App = () => (
    <ApolloApp/>
);
