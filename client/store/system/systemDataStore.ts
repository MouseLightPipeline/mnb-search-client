import {observable} from "mobx";

import {SystemConfigurationStore} from "./systemConfigurationStore";
import {TomographyStore} from "./tomographyStore";

export class SystemDataStore {
    @observable public SystemConfiguration: SystemConfigurationStore = new SystemConfigurationStore();

    @observable public Tomography: TomographyStore = new TomographyStore();
}

export const rootDataStore: SystemDataStore = new SystemDataStore();
