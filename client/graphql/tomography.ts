import gql from "graphql-tag";

export const TOMOGRAPHY_QUERY = gql`query TomographyQuery {
  tomographyMetadata {
    id
    name
    origin
    pixelSize
    threshold
    limits {
      horizontal
      sagittal
      coronal
    }
  }
}`;

export interface ISamplePlaneLimits {
    horizontal: [number, number];
    sagittal: [number, number];
    coronal: [number, number];
}

export interface ISampleTomography {
    id: string;
    name: string;
    origin: [number, number, number];
    pixelSize: [number, number, number];
    threshold: [number, number];
    limits: ISamplePlaneLimits;
}

export interface TomographyQueryResponse {
    tomographyMetadata: ISampleTomography[]
}
