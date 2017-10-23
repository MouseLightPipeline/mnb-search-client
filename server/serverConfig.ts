const configurations: any = {
    development: {
        port: 9683,
        graphQlEndpoint: "/graphql",
        graphQlHostname: "localhost",
        graphQlPort: 9681
    },
    test: {
        port: 9683,
        graphQlEndpoint: "/graphql",
        graphQlHostname: "search-api",
        graphQlPort: 9681
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

    let config = configurations[env];

    config.port = process.env.TRANSFORM_CLIENT_PORT || config.port;
    config.graphQlHostname = process.env.TRANSFORM_API_HOST || config.graphQlHostname;
    config.graphQlPort = process.env.TRANSFORM_API_PORT || config.graphQlPort;

    return config;
}

export const ServerConfiguration = loadServerConfiguration();
