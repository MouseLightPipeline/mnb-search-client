import gql from "graphql-tag";
import {Query} from "react-apollo";

import {INeuron} from "../models/neuron";
import {IPositionInput} from "../models/queryFilter";
import {BrainAreaFilterTypeOption} from "../models/brainAreaFilterType";
import {SearchScope} from "../models/uiQueryPredicate";

export const NEURONS_QUERY = gql`query SearchNeurons($context: SearchContext) {
  searchNeurons(context: $context) {
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

export type SearchPredicate = {
    predicateType: BrainAreaFilterTypeOption;
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
}

export type SearchContext = {
    scope: SearchScope,
    nonce: string,
    predicates: SearchPredicate[];
}

type NeuronsQueryVariable = {
    context: SearchContext;
}

export type NeuronsQueryData = {
    neurons: INeuron[];
    totalCount: number;
    queryTime: number;
    nonce: string;
    error: Error;
}

type NeuronsQueryResponse = {
    searchNeurons: NeuronsQueryData
}

export class NeuronsQuery extends Query<NeuronsQueryResponse, NeuronsQueryVariable> {
}
