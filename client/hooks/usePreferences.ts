import {useEffect} from "react";

import {PreferenceChangedEvent, PreferencesManager} from "../util/preferencesManager";

export const usePreferences = (listener: PreferenceChangedEvent) => {
    useEffect(() => {
        PreferencesManager.Instance.addListener(listener);

        return () => {
            PreferencesManager.Instance.removeListener(listener);

        }
    }, []);
};
