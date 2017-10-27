import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory} from "react-router";

import {ApolloApp} from "./components/ApolloApp";

import "react-checkbox-tree/lib/react-checkbox-tree.css"

require("file-loader?name=index.html!../index.html");
require("file-loader?name=loaderio-733b1ac1a51b46b4d1097d9b6970dbdb.txt!../loaderio-733b1ac1a51b46b4d1097d9b6970dbdb.txt");

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={ApolloApp}/>
    </Router>, rootEl
);
