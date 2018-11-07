import gql from "graphql-tag";
import {Query} from "react-apollo";

export const SYSTEM_MESSAGE_QUERY = gql`query SystemMessage {
    systemMessage
  	systemSettings {
  	  version
  	  release
  	}
}`;

type SystemMessageQueryResponse = {
    systemMessage: string;
    systemSettings: {
        version: string,
        release: string
    }
}

export class SystemMessageQuery extends Query<SystemMessageQueryResponse, {}> {
}
