const configuration = {
    port: 9683,
    graphQlEndpoint: "/graphql",
    graphQlHostname: "search-api",
    graphQlPort: 9681,
    authUser: "mouselight",
    authPassword: "auth_secret" // always override this, but in case env is not set, don't leave completely open
};

function loadServerConfiguration() {
    let config = Object.assign({}, configuration);

    config.port = process.env.SEARCH_CLIENT_PORT || config.port;
    config.graphQlHostname = process.env.SEARCH_API_HOST || config.graphQlHostname;
    config.graphQlPort = process.env.SEARCH_API_PORT || config.graphQlPort;
    config.authUser = process.env.SEARCH_AUTH_USER || config.authUser;
    config.authPassword = process.env.SEARCH_AUTH_PASS || config.authPassword;

    return config;
}

export const ServerConfiguration = loadServerConfiguration();
