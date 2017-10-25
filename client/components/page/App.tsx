import * as React from "react";
import {graphql, ChildProps} from "react-apollo";
import {Alert} from "react-bootstrap";

import {Content} from "./Content";
import {SettingsDialog} from "./Settings";
import {PreferencesManager} from "../../util/preferencesManager";
import {ConstantsQuery, ConstantsQueryResponse} from "../../graphql/constants";
import {HeadingWithData} from "./Header";
import {Footer} from "./Footer";
import {NdbConstants} from "../../models/constants";

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

class App extends React.Component<ChildProps<IAppProps, ConstantsQueryResponse>, IAppState> {
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

    public componentWillReceiveProps(props: ChildProps<IAppProps, ConstantsQueryResponse>) {
        if (props.data && !props.data.loading && !props.data.error) {
            NdbConstants.DefaultConstants.load(props.data)
        }
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

    private renderContent() {
        const {loading, error} = this.props.data;

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

        // Must not load/create unless the constants query has completed and is loaded.  Downstream components assume
        // that valid content exists at NdbConstants.DefaultConstants.
        return (
            <div style={styles.content}>
                <Content shouldUseUpdatedLayout={this.state.shouldUseUpdatedLayout} ref={(r) => this._content = r}/>
            </div>
        )
    }

    public render() {
        const apiVersion = NdbConstants.DefaultConstants.IsLoaded ? ` ${NdbConstants.DefaultConstants.ApiVersion}` : "";
        const clientVersion = NdbConstants.DefaultConstants.IsLoaded ? ` ${NdbConstants.DefaultConstants.ClientVersion}` : "";

        return (
            <div>
                <SettingsDialog show={this.state.isSettingsOpen} apiVersion={apiVersion} clientVersion={clientVersion}
                                isPublicRelease={NdbConstants.DefaultConstants.IsPublicRelease} onHide={() => this.onSettingsClose()}/>
                <HeadingWithData onSettingsClick={() => this.onSettingsClick()} onSetQuery={(f) => this.onSetQuery(f)}/>
                {this.renderContent()}
                <Footer/>
            </div>
        );
    }
}

export const AppWithData = graphql<ConstantsQueryResponse, IAppProps>(ConstantsQuery, {
    options: {}
})(App);

