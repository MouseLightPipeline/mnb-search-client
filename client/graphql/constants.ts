import gql from "graphql-tag";

import {ITracingStructure} from "../models/tracingStructure";
import {IStructureIdentifier} from "../models/structureIdentifier";
import {IQueryOperator} from "../models/queryOperator";
import {IBrainArea} from "../models/brainArea";

export const CONSTANTS_QUERY = gql`query ConstantsQuery($searchScope: Int) {
  systemSettings(searchScope: $searchScope) {
    apiVersion
    apiRelease
    neuronCount
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
    aliases
    structureId
    depth
    parentStructureId
    structureIdPath
    geometryColor
    geometryFile
    geometryEnable
  }
  systemMessage
}`;

export type SystemSettingsVariables = {
    searchScope: number;
}

export type SystemSettings = {
    apiVersion: string;
    apiRelease: string;
    neuronCount: number;
}

export type ConstantsQueryResponse = {
    systemSettings: SystemSettings;
    tracingStructures: ITracingStructure[];
    structureIdentifiers: IStructureIdentifier[];
    queryOperators: IQueryOperator[];
    brainAreas: IBrainArea[];
}
