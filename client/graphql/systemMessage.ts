import {gql} from "react-apollo";

export const SystemMessageQuery = gql`query SystemMessage {
    systemMessage
  	systemSettings {
  	  version
  	  release
  	}
}`;
