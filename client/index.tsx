import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory} from "react-router";

import {ApolloApp} from "./components/ApolloApp";

import "react-checkbox-tree/lib/react-checkbox-tree.css"

require("file-loader?name=index.html!../index.html");

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={ApolloApp}/>
    </Router>, rootEl
);
