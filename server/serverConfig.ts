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
    searchScope: SearchScope;
    systemEndpoint: string;
    graphQLService: ServiceLocation,
    tracingsService: ServiceLocation,
    staticService: ServiceLocation,
    exportService: ServiceLocation,
    exportLimit: number
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
    exportService: {
        hostname: "export-api",
        port: 5000,
        endpoint: "/export"
    },
    exportLimit: 20
};

function loadServerConfiguration() {
    const options = Object.assign({}, configuration);

    options.port = parseInt(process.env.SEARCH_CLIENT_PORT) || options.port;
    options.authRequired = process.env.SEARCH_AUTH_REQUIRED !== "false";
    options.authUser = process.env.SEARCH_AUTH_USER || options.authUser;
    options.authPassword = process.env.SEARCH_AUTH_PASS || options.authPassword;
    options.searchScope = process.env.SEARCH_CLIENT_SCOPE ? SearchScope[process.env.SEARCH_CLIENT_SCOPE] : options.searchScope;
    options.searchScope = options.searchScope === undefined ? SearchScope.Public : options.searchScope;

    options.graphQLService.hostname = process.env.SEARCH_API_HOST || process.env.CORE_SERVICES_ENDPOINT || options.graphQLService.hostname;
    options.graphQLService.port = parseInt(process.env.SEARCH_API_PORT) || options.graphQLService.port;
    options.graphQLService.endpoint = process.env.SEARCH_API_ENDPOINT || options.graphQLService.endpoint;

    options.tracingsService.hostname = process.env.SEARCH_TRACINGS_HOST || process.env.SEARCH_API_HOST || options.tracingsService.hostname;
    options.tracingsService.port = parseInt(process.env.SEARCH_TRACINGS_PORT) || parseInt(process.env.SEARCH_API_PORT) || options.tracingsService.port;
    options.tracingsService.endpoint = process.env.SEARCH_TRACINGS_ENDPOINT || process.env.SEARCH_API_ENDPOINT || options.tracingsService.endpoint;

    options.staticService.hostname = process.env.STATIC_API_HOST || options.staticService.hostname;
    options.staticService.port = parseInt(process.env.STATIC_API_PORT) || options.staticService.port;
    options.staticService.endpoint = process.env.STATIC_API_ENDPOINT || options.staticService.endpoint;

    options.exportService.hostname = process.env.EXPORT_API_HOST || options.exportService.hostname;
    options.exportService.port = parseInt(process.env.EXPORT_API_PORT) || options.exportService.port;
    options.exportService.endpoint = process.env.EXPORT_API_ENDPOINT || options.exportService.endpoint;

    options.exportLimit = parseInt(process.env.SEARCH_CLIENT_EXPORT_LIMIT) || options.exportLimit;

    return options;
}

export const ServerConfiguration = loadServerConfiguration();
