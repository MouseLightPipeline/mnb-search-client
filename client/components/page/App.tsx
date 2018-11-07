import * as React from "react";
import {Alert} from "react-bootstrap";

import {Content} from "./Content";
import {SettingsDialog} from "./Settings";
import {PreferencesManager} from "../../util/preferencesManager";
import {Footer} from "./Footer";
import {NdbConstants} from "../../models/constants";
import {CONSTANTS_QUERY, ConstantsQuery} from "../../graphql/constants";
import {PageHeader} from "./Header";

const styles = {
    content: {
        marginTop: "0px",
        marginBottom: "40px",
        overflow: "hidden" as "hidden",
        height: "calc(100% - 119px)"
    }
};

interface IAppProps {
}

interface IAppState {
    isSettingsOpen?: boolean;
    shouldUseUpdatedLayout?: boolean;
}

export class App extends React.Component<IAppProps, IAppState> {
    private _content = null;

    public constructor(props: IAppProps) {
        super(props);

        this.state = {
            isSettingsOpen: false,
            shouldUseUpdatedLayout: PreferencesManager.Instance.ShouldUseUpdatedLayout
        };

        fetch('/system', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (resp) => {
            try {
                const data = await resp.json();

                NdbConstants.DefaultConstants.ClientVersion = data.version;
            } catch (err) {
                console.log(err);
            }
        });
    }

    private onSetQuery(eventKey: any) {
        if (this._content) {
            this._content.onSetQuery(eventKey);
        }
    }

    private onSettingsClick() {
        this.setState({isSettingsOpen: true}, null);
    }

    private onSettingsClose() {
        this.setState({isSettingsOpen: false}, null);
    }

    private renderContent(loading, error) {
        if (error) {
            console.log(error);
            return (
                <div>
                    <Alert bsStyle="danger">
                        <div>
                            <h5>Service Error</h5>
                            {`${error.toString()}`}
                        </div>
                    </Alert>
                </div>
            );
        }

        if (loading) {
            const spinnerStyle = {
                width: 40,
                height: 40,
                border: "2px solid",
                borderColor: "#1e8fc6",
                borderBottomColor: "transparent",
                borderRadius: "100%",
                background: "transparent !important",
                verticalAlign: "middle",
                animation: "spinner 0.75s 0s infinite linear",
                animationFillMode: 'both',
                display: "inline-block"
            };

            return (
                <div>
                    <div style={{textAlign: "center", fontSize: "20px", width: "100%", padding: "20px"}}>
                        initializing
                    </div>
                    <div style={{textAlign: "center", fontSize: "20px", width: "100%", padding: "20px"}}>
                        <div style={spinnerStyle}/>
                    </div>
                </div>
            );
        }


        const style = Object.assign(styles.content, PreferencesManager.Instance.HideCursorOnPage ? {cursor: "none"} : {});

        // Must not load/create unless the constants query has completed and is loaded.  Downstream components assume
        // that valid content exists at NdbConstants.DefaultConstants.
        return (
            <div style={style}>
                <Content shouldUseUpdatedLayout={this.state.shouldUseUpdatedLayout} ref={(r) => this._content = r}/>
            </div>
        )
    }

    public render() {

        return (
            <ConstantsQuery query={CONSTANTS_QUERY}>
                {({loading, error, data}) => {
                    if (data && !loading && !error) {
                        NdbConstants.DefaultConstants.load(data);
                    }

                    const apiVersion = NdbConstants.DefaultConstants.IsLoaded ? ` ${NdbConstants.DefaultConstants.ApiVersion}` : "";
                    const clientVersion = NdbConstants.DefaultConstants.IsLoaded ? ` ${NdbConstants.DefaultConstants.ClientVersion}` : "";

                    return (
                        <div>
                            <SettingsDialog show={this.state.isSettingsOpen} apiVersion={apiVersion}
                                            clientVersion={clientVersion}
                                            isPublicRelease={NdbConstants.DefaultConstants.IsPublicRelease}
                                            onHide={() => this.onSettingsClose()}/>
                            <PageHeader onSettingsClick={() => this.onSettingsClick()}
                                             onSetQuery={(f) => this.onSetQuery(f)}/>
                            {this.renderContent(loading, error)}
                            <Footer/>
                        </div>
                    );
                }}
            </ConstantsQuery>
        );
    }
}

