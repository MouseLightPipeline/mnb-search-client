import {UIQueryFilter} from "../models/queryFilter";

export interface INotificationListener {
    preferenceChanged(name: string, value: any);
}


const prefix = "jne:";

export class PreferencesManager {

    private static _instance = null;

    private _notificationListeners: INotificationListener[] = [];

    public static get Instance(): PreferencesManager {
        if (!this._instance) {
            this._instance = new PreferencesManager();
        }

        return this._instance;
    }

    public static get HavePreferences() {
        return typeof(Storage) !== undefined;
    }

    public constructor() {
        this.validateDefaultSettings();
    }

    public addListener(listener: INotificationListener) {
        if (this._notificationListeners.indexOf(listener) === -1) {
            this._notificationListeners.push(listener);
        }
    }

    public removeListener(listener: INotificationListener) {
        this._notificationListeners = this._notificationListeners.filter(n => n !== listener);
    }

    private notifyListeners(name: string, value: any) {
        this._notificationListeners.map(n => {
            n.preferenceChanged(name, value);
        })
    }

    public get ShouldUseUpdatedLayout() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldUseUpdatedLayout") === "true";
        } else {
            return false;
        }
    }

    public get ShouldAutoCollapseOnQuery() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldAutoCollapseOnQuery") === "true";
        } else {
            return false;
        }
    }

    public set ShouldAutoCollapseOnQuery(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "shouldAutoCollapseOnQuery", b ? "true" : "false");
        }
    }

    public get ShouldAlwaysShowSoma() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldAlwaysShowSoma") === "true";
        } else {
            return false;
        }
    }

    public set ShouldAlwaysShowSoma(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "shouldAlwaysShowSoma", b ? "true" : "false");
        }
    }

    public get ShouldAlwaysShowFullTracing() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "shouldAlwaysShowFullTracing") === "true";
        } else {
            return false;
        }
    }

    public set ShouldAlwaysShowFullTracing(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "shouldAlwaysShowFullTracing", b ? "true" : "false");
        }
    }

    public get IsNeuronListDocked() {
        if (typeof(Storage) !== undefined) {
            return sessionStorage.getItem(prefix + "isNeuronListDocked") === "true";
        } else {
            return true;
        }
    }

    public set IsNeuronListDocked(b: boolean) {
        if (typeof(Storage) !== undefined) {
            sessionStorage.setItem(prefix + "isNeuronListDocked", b ? "true" : "false");
        }
    }

    public get IsCompartmentListDocked() {
        if (typeof(Storage) !== undefined) {
            return sessionStorage.getItem(prefix + "isCompartmentListDocked") === "true";
        } else {
            return true;
        }
    }

    public set IsCompartmentListDocked(b: boolean) {
        if (typeof(Storage) !== undefined) {
            sessionStorage.setItem(prefix + "isCompartmentListDocked", b ? "true" : "false");
        }
    }

    public get TracingSelectionHiddenOpacity() {
        if (typeof(Storage) !== undefined) {
            return parseFloat(localStorage.getItem(prefix + "tracingSelectionHiddenOpacity"));
        } else {
            return 0.0;
        }
    }

    public set TracingSelectionHiddenOpacity(n: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "tracingSelectionHiddenOpacity", n.toFixed(2));
        }
    }

    public get TracingFetchBatchSize() {
        if (typeof(Storage) !== undefined) {
            return parseInt(localStorage.getItem(prefix + "tracingFetchBatchSize"));
        } else {
            return 0.0;
        }
    }

    public set TracingFetchBatchSize(n: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "tracingFetchBatchSize", n.toFixed(0));
        }
    }

    public AppendQueryHistory(filters: UIQueryFilter[]) {
        if (typeof(Storage) !== undefined) {
            const obj = {
                timestamp: new Date(),
                filters: filters.map(f => f.serialize())
            };

            localStorage.setItem(prefix + "queryHistory", JSON.stringify(obj));
        }
    }

    public get LastQuery() {
        if (typeof(Storage) !== undefined) {
            const str = localStorage.getItem(prefix + "queryHistory");

            if (str) {
                const obj = JSON.parse(str);

                return obj.filters;
            }
        }

        return null;
    }

    public get ViewerBackgroundColor() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "viewerBackgroundColor");
        } else {
            return "#FFFFFF";
        }
    }

    public set ViewerBackgroundColor(n: string) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "viewerBackgroundColor", n);
        }

        this.notifyListeners("viewerBackgroundColor", n);
    }

    private validateDefaultSettings() {
        if (typeof(Storage) !== undefined) {
            if (!localStorage.getItem(prefix + "shouldAutoCollapseOnQuery")) {
                localStorage.setItem(prefix + "shouldAutoCollapseOnQuery", "false");
            }

            if (!localStorage.getItem(prefix + "shouldAlwaysShowSoma")) {
                localStorage.setItem(prefix + "shouldAlwaysShowSoma", "true");
            }

            if (!localStorage.getItem(prefix + "shouldAlwaysShowFullTracing")) {
                localStorage.setItem(prefix + "shouldAlwaysShowFullTracing", "true");
            }

            if (!sessionStorage.getItem(prefix + "isNeuronListDocked")) {
                sessionStorage.setItem(prefix + "isNeuronListDocked", "true");
            }

            if (!sessionStorage.getItem(prefix + "isCompartmentListDocked")) {
                sessionStorage.setItem(prefix + "isCompartmentListDocked", "true");
            }

            if (!localStorage.getItem(prefix + "tracingFetchBatchSize")) {
                localStorage.setItem(prefix + "tracingFetchBatchSize", "10.0");
            }

            if (!localStorage.getItem(prefix + "tracingSelectionHiddenOpacity")) {
                localStorage.setItem(prefix + "tracingSelectionHiddenOpacity", "0.0");
            }

            if (!localStorage.getItem(prefix + "viewerBackgroundColor")) {
                localStorage.setItem(prefix + "viewerBackgroundColor", "#FFFFFF");
            }
        }
    }
}
