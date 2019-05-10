import * as React from "react";
import {useQuery} from "react-apollo-hooks";
import {observer} from "mobx-react-lite";
import { Message} from "semantic-ui-react";

import {useStore} from "./App";
import {TOMOGRAPHY_QUERY, TomographyQueryResponse} from "../../graphql/tomography";
import {AppLoading} from "./AppLoading";

export const AppTomography = observer((props: any) => {
    console.log("render 2");

    const Store = useStore();

    const {data, error, loading} = useQuery<TomographyQueryResponse>(TOMOGRAPHY_QUERY);

    if (loading) {
        return <AppLoading message="initializing tomography"/>;
    }

    if (error) {
        return (
            <div style={{padding: "20px"}}>
                <Message negative icon="exclamation triangle" header="Service not responding"
                         content="System data could not be loaded."/>
            </div>
        );
    }

    Store.Tomography.fromSource(data.tomographyMetadata);

    return props.children;
});
