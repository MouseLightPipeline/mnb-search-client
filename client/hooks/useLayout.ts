import {useViewModel} from "../components/app/App";

export const useLayout = () => {
    const {Layout} = useViewModel();

    return Layout;
};
