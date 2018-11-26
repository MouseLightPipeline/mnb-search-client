import {SearchScope} from "./searchScope";

export type ServiceLocation = {
    hostname: string;
    port: number;
    endpoint: string;
}

export interface IServiceOptions {
    port: number;
    authRequired: boolean,
    authUser: string,
    authPassword: string,
    searchScope: SearchScope.Public
    systemEndpoint: string;
    graphQLService: ServiceLocation,
    tracingsService: ServiceLocation,
    staticService: ServiceLocation,
    exportSwcService: ServiceLocation,
    exportJsonService: ServiceLocation
}

const configuration: IServiceOptions = {
    port: 5000,
    authRequired: true,
    authUser: "mouselight",
    authPassword: "auth_secret", // always override this, but in the event env is not set, don't leave completely open
    searchScope: SearchScope.Public,
    systemEndpoint: "/system",
    graphQLService: {
        hostname: "search-api",
        port: 5000,
        endpoint: "/graphql"
    },
    tracingsService: {
        hostname: "search-api",
        port: 5000,
        endpoint: "/tracings",
    },
    staticService: {
        hostname: "static-api",
        port: 5000,
        endpoint: "/static",
    },
    exportSwcService: {
        hostname: "export-api",
        port: 5000,
        endpoint: "/swc"
    },
    exportJsonService: {
        hostname: "export-api",
        port: 5000,
        endpoint: "/json"
    }
};

function loadServerConfiguration() {
    const options = Object.assign({}, configuration);

    options.port = parseInt(process.env.SEARCH_CLIENT_PORT) || options.port;
    options.authRequired = process.env.SEARCH_AUTH_REQUIRED !== "false";
    options.authUser = process.env.SEARCH_AUTH_USER || options.authUser;
    options.authPassword = process.env.SEARCH_AUTH_PASS || options.authPassword;
    options.searchScope = process.env.SEARCH_CLIENT_SCOPE ? SearchScope[process.env.SEARCH_CLIENT_SCOPE] : options.searchScope;
    options.searchScope = options.searchScope === undefined ? SearchScope.Public : options.searchScope;

    options.graphQLService.hostname = process.env.SEARCH_API_HOST || options.graphQLService.hostname;
    options.graphQLService.port = parseInt(process.env.SEARCH_API_PORT) || options.graphQLService.port;
    options.graphQLService.endpoint = process.env.SEARCH_API_ENDPOINT || options.graphQLService.endpoint;

    options.tracingsService.hostname = process.env.SEARCH_TRACINGS_HOST || process.env.SEARCH_API_HOST || options.tracingsService.hostname;
    options.tracingsService.port = parseInt(process.env.SEARCH_TRACINGS_PORT) || parseInt(process.env.SEARCH_API_PORT) || options.tracingsService.port;
    options.tracingsService.endpoint = process.env.SEARCH_TRACINGS_ENDPOINT || process.env.SEARCH_API_ENDPOINT || options.tracingsService.endpoint;

    options.staticService.hostname = process.env.STATIC_API_HOST || options.staticService.hostname;
    options.staticService.port = parseInt(process.env.STATIC_API_PORT) || options.staticService.port;
    options.staticService.endpoint = process.env.STATIC_API_ENDPOINT || options.staticService.endpoint;

    options.exportSwcService.hostname = process.env.EXPORT_API_HOST || options.exportSwcService.hostname;
    options.exportSwcService.port = parseInt(process.env.EXPORT_API_PORT) || options.exportSwcService.port;
    options.exportSwcService.endpoint = process.env.EXPORT_API_SWC_ENDPOINT || options.exportSwcService.endpoint;

    options.exportJsonService.hostname = process.env.EXPORT_API_HOST || options.exportJsonService.hostname;
    options.exportJsonService.port = parseInt(process.env.EXPORT_API_PORT) || options.exportJsonService.port;
    options.exportJsonService.endpoint = process.env.EXPORT_API_JSON_ENDPOINT || options.exportJsonService.endpoint;

    return options;
}

export const ServerConfiguration = loadServerConfiguration();
