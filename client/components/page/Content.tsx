import * as React from "react";

import {IFilterInput} from "../../models/queryFilter";
import {QueryPageWithData} from "./QueryPage";

interface IContentProps {
    shouldUseUpdatedLayout?: boolean;
}

interface IContentState {
    queryFilters?: IFilterInput[];
}

/***
 * Holds query filters as state so they can be pushed onto the GraphQL component as props and trigger a new query when
 * changed.
 */
export class Content extends React.Component<IContentProps, IContentState> {
    private _queryPage = null;

    public constructor(props: IContentProps) {
        super(props);

        this.state = {queryFilters: []};
    }

    public onSetQuery(filterData: any) {
        if (this._queryPage) {
            this._queryPage.getWrappedInstance().onSetQuery(filterData);
        }
    }

    private applyFilters(queryFilters: IFilterInput[]) {
        this.setState({queryFilters: queryFilters}, null);
    }

    public render() {
        const props = {
            queryFilters: this.state.queryFilters,
            applyFilters: (queryFilters: IFilterInput[]) => this.applyFilters(queryFilters)
        };

        return (
            <QueryPageWithData {...props} ref={(r) => this._queryPage = r}/>
        );
    }
}
