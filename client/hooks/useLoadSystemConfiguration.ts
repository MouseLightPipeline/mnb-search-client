import {useEffect} from "react";

import {querySystemSettings} from "../services/systemService";
import {useStore} from "../components/app/App";

export const useLoadSystemConfiguration = () => {
    const {SystemConfiguration} = useStore();

    useEffect(() => {
        const fetchSystemInfo = async () => {
            await querySystemSettings(SystemConfiguration);
        };

        fetchSystemInfo().then().catch((err) => console.log(err));
    }, []);
};
