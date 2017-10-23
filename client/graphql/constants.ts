import {gql} from "react-apollo";
import {ITracingStructure} from "../models/tracingStructure";
import {IStructureIdentifier} from "../models/structureIdentifier";
import {IQueryOperator} from "../models/queryOperator";
import {IBrainArea} from "../models/brainArea";

export const ConstantsQuery = gql`query {
  systemSettings {
    version
    release
  }
  tracingStructures {
    id
    name
    value
  }
  structureIdentifiers {
    id
    name
    value
  }
  queryOperators {
    id
    display
    operator
  }
  brainAreas {
    id
    name
    acronym
    structureId
    depth
    parentStructureId
    structureIdPath
    geometryColor
    geometryFile
    geometryEnable
  }
}`;

export interface ISystemSettings {
    version: string;
    release: string;
}

export interface ConstantsQueryResponse {
    systemSettings: ISystemSettings;
    tracingStructures: ITracingStructure[];
    structureIdentifiers: IStructureIdentifier[];
    queryOperators: IQueryOperator[];
    brainAreas: IBrainArea[];
}
