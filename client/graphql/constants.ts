import gql from "graphql-tag";
import {Query} from "react-apollo";

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
    structureId
    depth
    parentStructureId
    structureIdPath
    geometryColor
    geometryFile
    geometryEnable
  }
}`;

type SystemSettingsVariables = {
    searchScope: number;
}

export interface ISystemSettings {
    apiVersion: string;
    apiRelease: string;
    neuronCount: number;
}

export interface ConstantsQueryResponse {
    systemSettings: ISystemSettings;
    tracingStructures: ITracingStructure[];
    structureIdentifiers: IStructureIdentifier[];
    queryOperators: IQueryOperator[];
    brainAreas: IBrainArea[];
}

export class ConstantsQuery extends Query<ConstantsQueryResponse, SystemSettingsVariables> {
}
