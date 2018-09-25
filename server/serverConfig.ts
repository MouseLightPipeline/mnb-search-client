const configurations = {
    development: {
        port: 9683,
        graphQlEndpoint: "/graphql",
        graphQlHostname: "localhost",
        graphQlPort: 9681,
        authPassword: ""
    },
    production: {
        port: 9683,
        graphQlEndpoint: "/graphql",
        graphQlHostname: "search-api",
        graphQlPort: 9681
    }
};

function loadServerConfiguration() {
    let env = process.env.NODE_ENV || "development";

    let config = configurations[env] || configurations.development;

    config.port = process.env.SEARCH_CLIENT_PORT || config.port;
    config.graphQlHostname = process.env.SEARCH_API_HOST || config.graphQlHostname;
    config.graphQlPort = process.env.SEARCH_API_PORT || config.graphQlPort;
    config.authPassword = process.env.SEARCH_AUTH_PASS || config.authPassword;

    return config;
}

export const ServerConfiguration = loadServerConfiguration();
