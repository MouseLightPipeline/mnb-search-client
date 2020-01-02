import {useViewModel} from "../components/app/App";

export const useCompartments = () => {
  const {Compartments} = useViewModel();

  return Compartments;
};
