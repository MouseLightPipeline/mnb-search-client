import * as React from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "react-apollo-hooks";
import {Message} from "semantic-ui-react";

import {CONSTANTS_QUERY, ConstantsQueryResponse, SystemSettingsVariables} from "../../graphql/constants";
import {useStore} from "./App";
import {AppLoading} from "./AppLoading";

/**
 * Component that requires constant system data be loaded before rendering children.  This currently includes
 * * system configuration (versions, neuron count)
 * * query operators (gt, lt, etc...)
 * * tracing and structure identifiers
 * * compartment data
 */
export const AppConstants = observer((props: any) => {
    const Store = useStore();

    const {data, error, loading} = useQuery<ConstantsQueryResponse, SystemSettingsVariables>(CONSTANTS_QUERY, {variables: {searchScope: Store.SystemConfiguration.searchScope}});

    if (loading) {
        return <AppLoading message="initializing system data"/>;
    }

    if (error) {
        return (
            <div style={{padding: "20px"}}>
                <Message negative icon="exclamation triangle" header="Service not responding"
                         content="System data could not be loaded."/>
            </div>
        );
    }

    Store.Constants.load(data!);

    return props.children;
});
