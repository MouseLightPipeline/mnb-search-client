import * as path from "path";
import * as fs from "fs";

const express = require("express");
const proxy = require("express-http-proxy");
const passport = require("passport");
const DigestStrategy = require("passport-http").DigestStrategy;

const debug = require("debug")("mnb:search-client:app");

import {ServerConfiguration} from "./serverConfig";
import {SearchScope} from "./searchScope";

const version = readSystemVersion();

debug(`search scope will limited to ${SearchScope[ServerConfiguration.searchScope]}`);

const apiUri = `http://${ServerConfiguration.graphQLService.hostname}:${ServerConfiguration.graphQLService.port}`;
const tracingsUri = `http://${ServerConfiguration.tracingsService.hostname}:${ServerConfiguration.tracingsService.port}`;
const staticUri = `http://${ServerConfiguration.staticService.hostname}:${ServerConfiguration.staticService.port}`;
const exportSwcUri = `http://${ServerConfiguration.exportSwcService.hostname}:${ServerConfiguration.exportSwcService.port}`;
const exportJsonUri = `http://${ServerConfiguration.exportJsonService.hostname}:${ServerConfiguration.exportJsonService.port}`;

let app = null;

const maintainBaseUrl = req => req.baseUrl;

passport.use(new DigestStrategy({qop: 'auth'},
    function (username: any, done: any) {
        if (username === ServerConfiguration.authUser) {
            return done(null, {id: 1, name: username}, ServerConfiguration.authPassword);
        } else {
            return done("Invalid user", null);
        }
    },
    function (params: any, done: any) {
        // validate nonce as necessary
        done(null, true)
    }
));

passport.serializeUser(function (user: any, done: any) {
    done(null, user.id);
});

passport.deserializeUser(function (id: any, done: any) {
    done(null, {id: 1, name: ServerConfiguration.authUser});
});

if (process.env.NODE_ENV !== "production") {
    app = devServer();
} else {
    debug("configuring production express server");

    const rootPath = path.resolve(path.join(__dirname, "public"));
    app = express();

    if (ServerConfiguration.authRequired) {
        app.use(passport.initialize());

        app.get("/", passport.authenticate('digest', {session: false}), (request: any, response: any, next: any) => {
            next();
        });
    }

    app.use(ServerConfiguration.systemEndpoint, (req, res) => {
        res.json({
            systemVersion: version,
            searchScope: ServerConfiguration.searchScope,
            exportLimit: ServerConfiguration.exportLimit
        });
    });

    // For most deployments the following are intercepted by an nginx instance to load balance between multiple backend
    // instances.  However, there may be certain client instances where  directly to this

    debug(`proxying ${ServerConfiguration.graphQLService.endpoint} to ${apiUri}`);
    app.use(`${ServerConfiguration.graphQLService.endpoint}`, proxy(`${apiUri}`, {proxyReqPathResolver: maintainBaseUrl}));

    debug(`proxying ${ServerConfiguration.tracingsService.endpoint} to ${tracingsUri}`);
    app.use(`${ServerConfiguration.tracingsService.endpoint}`, proxy(`${tracingsUri}`, {proxyReqPathResolver: maintainBaseUrl}));

    debug(`proxying ${ServerConfiguration.staticService.endpoint} to ${staticUri}`);
    app.use(`${ServerConfiguration.staticService.endpoint}`, proxy(`${staticUri}`, {proxyReqPathResolver: req => "/static" + req.url}));

    debug(`proxying ${ServerConfiguration.exportSwcService.endpoint} to ${exportSwcUri}`);
    app.use(`${ServerConfiguration.exportSwcService.endpoint}`, proxy(`${exportSwcUri}`, {proxyReqPathResolver: maintainBaseUrl}));

    debug(`proxying ${ServerConfiguration.exportJsonService.endpoint} to ${exportJsonUri}`);
    app.use(`${ServerConfiguration.exportJsonService.endpoint}`, proxy(`${exportJsonUri}`, {proxyReqPathResolver: maintainBaseUrl}));

    app.use(express.static(rootPath));

    app.use("/", (req, res) => {
        res.sendFile(path.join(rootPath, "index.html"));
    });
}

app.listen(ServerConfiguration.port, "0.0.0.0", () => {
    if (process.env.NODE_ENV !== "production") {
        debug(`listening at http://localhost:${ServerConfiguration.port}/`);
    }
});

function devServer() {
    const webpackConfig = require("../webpack.dev.config.js");
    const Webpack = require("webpack");
    const webpackDevServer = require("webpack-dev-server");
    const compiler = Webpack(webpackConfig);

    return new webpackDevServer(compiler, {
        stats: {
            colors: true
        },
        proxy: {
            [ServerConfiguration.graphQLService.endpoint]: {
                target: apiUri
            },
            [ServerConfiguration.tracingsService.endpoint]: {
                target: tracingsUri
            },
            [ServerConfiguration.staticService.endpoint]: {
                target: staticUri
            },
            [ServerConfiguration.exportSwcService.endpoint]: {
                target: exportSwcUri
            },
            [ServerConfiguration.exportJsonService.endpoint]: {
                target: exportJsonUri
            },
            ["/slice"]: {
                target: staticUri
            }
        },
        before: (app) => {
            app.use(ServerConfiguration.systemEndpoint, (req, res) => {
                res.json({
                    systemVersion: version,
                    searchScope: ServerConfiguration.searchScope,
                    exportLimit: ServerConfiguration.exportLimit
                });
            });
        },
        disableHostCheck: true,
        publicPath: webpackConfig.output.publicPath,
        historyApiFallback: true,
        noInfo: false,
        quiet: false
    });
}

function readSystemVersion(): string {
    try {
        const contents = JSON.parse(fs.readFileSync(path.resolve("package.json")).toString());
        debug(`system version set to ${contents.version}`);
        return contents.version;
    } catch (err) {
        console.log(err);
        return "";
    }
}