import {observable} from "mobx";

import {SystemConfigurationStore} from "./systemConfigurationStore";
import {TomographyCollection} from "./tomographyCollection";

export class SystemDataStore {
    @observable public SystemConfiguration: SystemConfigurationStore = new SystemConfigurationStore();

    @observable public Tomography: TomographyCollection = new TomographyCollection();
}

export const rootDataStore: SystemDataStore = new SystemDataStore();
