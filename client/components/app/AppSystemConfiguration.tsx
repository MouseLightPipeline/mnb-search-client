import * as React from "react";
import {observer} from "mobx-react-lite";

import {useLoadSystemConfiguration} from "../../hooks/useLoadSystemConfiguration";
import {useStore} from "./App";
import {AppLoading} from "./AppLoading";
import {SearchScope} from "../../models/uiQueryPredicate";

/**
 * Component that requires the system configuration API data be fulfilled before rendering children.
 */
export const AppSystemConfiguration = observer((props: any) => {
    useLoadSystemConfiguration();

    const {SystemConfiguration} = useStore();

    if (SystemConfiguration.searchScope === SearchScope.Unset) {
        return <AppLoading message="initializing system configuration"/>;
    }

    return props.children;
});
