import {action, observable} from "mobx";

import {SearchScope} from "../../models/uiQueryPredicate";

export class SystemConfigurationStore {
    @observable searchScope: SearchScope = SearchScope.Unset;
    @observable systemVersion: string = "";
    @observable exportLimit: number = 0;

    @action
    public update(data: any) {
        this.searchScope = data.searchScope;
        this.systemVersion = data.systemVersion;
        this.exportLimit = data.exportLimit;
    }
}
