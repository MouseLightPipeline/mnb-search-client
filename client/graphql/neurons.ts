import gql from "graphql-tag";
import {Query} from "react-apollo";
import {INeuron} from "../models/neuron";
import {IPositionInput} from "../models/queryFilter";

export const NEURONS_QUERY = gql`query QueryData($filters: [FilterInput!]) {
  queryData(filters: $filters) {
    totalCount
    queryTime
    nonce
    error {
      name
      message
    }

    neurons {
      id
      idString
      brainArea {
        id
        acronym
      }
      tracings {
        id
        tracingStructure {
          id
          name
          value
        }
        soma {
          id
          x
          y
          z
          radius
          parentNumber
          sampleNumber
          brainAreaId
          structureIdentifierId
        }
      }
    }
  }
}`;


export type QueryPredicate = {
    tracingIdsOrDOIs: string[];
    tracingIdsOrDOIsExactMatch: boolean;
    tracingStructureIds: string[];
    nodeStructureIds: string[];
    operatorId: string;
    amount: number;
    brainAreaIds: string[];
    arbCenter: IPositionInput;
    arbSize: number;
    invert: boolean;
    composition: number;
    nonce: string;
}

type NeuronsQueryVariable = {
    filters: QueryPredicate[];
}

export type NeuronsQueryData = {
    neurons: INeuron[];
    totalCount: number;
    queryTime: number;
    nonce: string;
    error: Error;
}

type NeuronsQueryResponse = {
    queryData: NeuronsQueryData
}

export class NeuronsQuery extends Query<NeuronsQueryResponse, NeuronsQueryVariable> {
}
