import {observable} from "mobx";

import {SystemConfigurationStore} from "./systemConfigurationStore";

export class SystemDataStore {
    @observable systemConfiguration: SystemConfigurationStore = new SystemConfigurationStore();
}

export const rootDataStore: SystemDataStore = new SystemDataStore();
