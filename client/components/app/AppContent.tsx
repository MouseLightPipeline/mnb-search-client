import * as React from "react";
import {observer} from "mobx-react-lite";

import {useStore} from "./App";
import {NdbConstants} from "../../models/constants";
import {Content} from "../page/Content";

export const AppContent = observer(() => {
    const {SystemConfiguration} = useStore();

    return <Content constants={NdbConstants.DefaultConstants} searchScope={SystemConfiguration.searchScope}
                    systemVersion={SystemConfiguration.systemVersion} exportLimit={SystemConfiguration.exportLimit}/>;
});
