import gql from "graphql-tag";
import {Query} from "react-apollo";

import {ITracingStructure} from "../models/tracingStructure";
import {IStructureIdentifier} from "../models/structureIdentifier";
import {IQueryOperator} from "../models/queryOperator";
import {IBrainArea} from "../models/brainArea";

export const CONSTANTS_QUERY = gql`query {
  systemSettings {
    version
    release
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

export interface ISystemSettings {
    version: string;
    release: string;
    neuronCount: number;
}

export interface ConstantsQueryResponse {
    systemSettings: ISystemSettings;
    tracingStructures: ITracingStructure[];
    structureIdentifiers: IStructureIdentifier[];
    queryOperators: IQueryOperator[];
    brainAreas: IBrainArea[];
}

export class ConstantsQuery extends Query<ConstantsQueryResponse, {}> {
}
