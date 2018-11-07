import * as React from "react";
import * as ReactDOM from "react-dom";

import {ApolloApp} from "./components/ApolloApp";

import "react-checkbox-tree/lib/react-checkbox-tree.css"

require("file-loader?name=index.html!../index.html");
require("file-loader?name=loaderio-733b1ac1a51b46b4d1097d9b6970dbdb.txt!../loaderio-733b1ac1a51b46b4d1097d9b6970dbdb.txt");

import "react-select/dist/react-select.css";
import "react-virtualized/styles.css"
import "react-virtualized-select/styles.css"

import "../assets/style.css";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <ApolloApp/>, rootEl
);
