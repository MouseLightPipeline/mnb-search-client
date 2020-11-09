import {observable} from "mobx";

import {SystemConfigurationStore} from "./systemConfigurationStore";
import {TomographyCollection} from "./tomographyCollection";
import {NdbConstants} from "../../models/constants";

export class SystemDataStore {
    @observable public SystemConfiguration: SystemConfigurationStore = new SystemConfigurationStore();

    @observable public Tomography: TomographyCollection = new TomographyCollection();

    @observable public Constants: NdbConstants = new NdbConstants();
}
