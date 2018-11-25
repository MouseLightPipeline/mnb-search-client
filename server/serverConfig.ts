import {SearchScope} from "../client/models/uiQueryPredicate";

const configuration = {
    port: 5000,
    graphQlHostname: "search-api",
    graphQlPort: 5000,
    graphQlEndpoint: "/graphql",
    staticHostname: "static-api",
    staticPort: 5000,
    exportHostname: "export-api",
    exportPort: 5000,
    authRequired: true,
    authUser: "mouselight",
    authPassword: "auth_secret", // always override this, but in the event env is not set, don't leave completely open
    searchScope: SearchScope.Public
};

function loadServerConfiguration() {
    let config = Object.assign({}, configuration);

    config.port = parseInt(process.env.SEARCH_CLIENT_PORT) || config.port;
    config.graphQlHostname = process.env.SEARCH_API_HOST || config.graphQlHostname;
    config.graphQlPort = parseInt(process.env.SEARCH_API_PORT) || config.graphQlPort;
    config.staticHostname = process.env.STATIC_API_HOST || config.staticHostname;
    config.staticPort = parseInt(process.env.STATIC_API_PORT) || config.staticPort;
    config.exportHostname = process.env.EXPORT_API_HOST || config.exportHostname;
    config.exportPort = parseInt(process.env.EXPORT_API_PORT) || config.exportPort;
    config.authRequired = process.env.SEARCH_AUTH_REQUIRED !== "false";
    config.authUser = process.env.SEARCH_AUTH_USER || config.authUser;
    config.authPassword = process.env.SEARCH_AUTH_PASS || config.authPassword;
    config.searchScope = process.env.SEARCH_CLIENT_SCOPE ? SearchScope[process.env.SEARCH_CLIENT_SCOPE] || config.searchScope : config.searchScope;

    return config;
}

export const ServerConfiguration = loadServerConfiguration();
