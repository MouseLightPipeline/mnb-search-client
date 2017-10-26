import * as path from "path";

const express = require("express");
const passport = require("passport");
const DigestStrategy = require("passport-http").DigestStrategy;

let webpackConfig = null;
let Webpack = null;
let webpackDevMiddleware = null;
let webpackDevServer = null;
let webpackHotMiddleware = null;
let compiler = null;

if (process.env.NODE_ENV !== "production") {
    webpackConfig = require("../webpack.dev.config.js");
    Webpack = require("webpack");
    webpackDevMiddleware = require("webpack-dev-middleware");
    webpackHotMiddleware = require("webpack-hot-middleware");
    webpackDevServer = require("webpack-dev-server");
    compiler = Webpack(webpackConfig);
}

const serveClear = process.env.NB_OMIT_PASSWORD === "omit";

import {ServerConfiguration} from "./serverConfig";
import * as fs from "fs";

const rootPath = path.resolve(path.join(__dirname, "..", "public"));

const version = readSystemVersion();

let app = null;

passport.use(new DigestStrategy({qop: 'auth'},
    function (username: any, done: any) {
        if (username === "mouselight") {
            return done(null, {id: 1, name: username}, "yrotation");
        } else {
            return done("Invalid user", null);
        }
    },
    function (params: any, done: any) {
        // validate nonces as necessary
        done(null, true)
    }
));

passport.serializeUser(function (user: any, done: any) {
    done(null, user.id);
});

passport.deserializeUser(function (id: any, done: any) {
    done(null, {id: 1, name: "mouselight"});
});

if (process.env.NODE_ENV !== "production") {
    app = devServer();
} else {
    app = express();

    if (!serveClear) {
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
    const apiUri = `http://${ServerConfiguration.graphQlHostname}:${ServerConfiguration.graphQlPort}`;

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
            "/swc": {
                target: "http://localhost:9691"
            },
            "/json": {
                target: "http://localhost:9691"
            }
        },
        setup: (app) => {
            app.use("/system", (req, res) => {
                res.json({version});
            });
        },
        contentBase: path.resolve(path.join(__dirname, "..", "public")),
        disableHostCheck: true,
        publicPath: webpackConfig.output.publicPath,
        // hot: true,
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