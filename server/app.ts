import * as path from "path";

const express = require("express");
const passport = require("passport");
const DigestStrategy = require("passport-http").DigestStrategy;

const debug = require("debug")("ndb:search-client:app");

import {ServerConfiguration} from "./serverConfig";
import * as fs from "fs";

const version = readSystemVersion();

let app = null;

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

    app.use(express.static(rootPath));

    app.use("/", (req, res) => {
        res.sendFile(path.join(rootPath, "index.html"));
    });
}

app.listen(ServerConfiguration.port, "0.0.0.0", () => {
    if (process.env.NODE_ENV !== "production") {
        console.log(`Listening at http://localhost:${ServerConfiguration.port}/`);
    }
});

function devServer() {
    const staticUri = `http://${ServerConfiguration.staticHostname}:${ServerConfiguration.staticPort}`;
    const apiUri = `http://${ServerConfiguration.graphQlHostname}:${ServerConfiguration.graphQlPort}`;
    const exportUri = `http://${ServerConfiguration.exportHostname}:${ServerConfiguration.exportPort}`;

    const webpackConfig = require("../webpack.dev.config.js");
    const Webpack = require("webpack");
    const webpackDevServer = require("webpack-dev-server");
    const compiler = Webpack(webpackConfig);

    return new webpackDevServer(compiler, {
        stats: {
            colors: true
        },
        proxy: {
            "/graphql": {
                target: apiUri
            },
            "/tracings": {
                target: apiUri
            },
            "/public": {
                target: staticUri
            },
            "/swc": {
                target: exportUri
            },
            "/json": {
                target: exportUri
            }
        },
        setup: (app) => {
            app.use("/system", (req, res) => {
                res.json({version});
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
        return contents.version;
    } catch (err) {
        console.log(err);
        return "";
    }
}