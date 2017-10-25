import * as React from "react";
import {Link} from "react-router";
import {Navbar, Nav, Glyphicon, Badge, NavItem, NavDropdown, MenuItem, Modal} from "react-bootstrap"
import {graphql, QueryProps} from "react-apollo";

import {SystemMessageQuery} from "../../graphql/systemMessage";
import {PreferencesManager} from "../../util/preferencesManager";
import {examples} from "../../examples";
import {TutorialDialog} from "./Tutorial";

const logoImage = require("file-loader!../../../assets/mouseLight_NB_color.svg");
const hhmiImage = require("file-loader!../../../assets/hhmi_logo.png");

interface ISystemMessageQuery {
    systemMessage: string;
}

interface IHeadingProps {
    data?: QueryProps & ISystemMessageQuery;
    onSettingsClick(): void;
    onSetQuery(filterDatA: any): void;
}

interface IHeadingState {
    showSettings?: boolean;
    showTutorial?: boolean;
}

class Heading extends React.Component<IHeadingProps, IHeadingState> {
    public constructor(props: IHeadingProps) {
        super(props);

        this.state = {
            showSettings: false,
            showTutorial: false
        }
    }

    private onSelectExampleQuery(eventKey: any) {
        this.props.onSetQuery(eventKey);
    }

    private onSelectHelpMenuItem(eventKey) {
        if (!eventKey) {
            return;
        }

        this.setState({showSettings: true});
    }

    private onHideSettings() {
        this.setState({showSettings: false});
    }

    private onHideTutorial() {
        this.setState({showTutorial: false});
    }

    public render() {
        const menuItems = examples.map(s => {
            return (<MenuItem eventKey={s} key={s.name}>{s.name}</MenuItem>);
        });

        return (
            <Navbar fluid style={{borderRadius: 0, marginBottom: 0, height: 79}}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                marginLeft: "0px",
                                height: "100%"
                            }}>
                                <img src={logoImage} height={52} style={{order: 1}}/>
                                <img src={hhmiImage} height={48} style={{order: 2, marginLeft: "30px"}}/>
                            </div>
                        </Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight style={{marginRight: "5px", paddingTop: "18px"}}>
                        {this.state.showTutorial ? <TutorialDialog show={this.state.showTutorial}
                                                                   onHide={() => this.onHideTutorial()}/> : null}
                        <Modal show={this.state.showSettings} onHide={() => this.onHideSettings()}
                               aria-labelledby="contained-modal-title-sm">
                            <Modal.Header closeButton>
                                <Modal.Title id="shortcuts-modal-title-sm">Viewer Shortcuts</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <ul>
                                    <li>ctrl-click: snap to position</li>
                                    <li>shift-click: add neuron to selection</li>
                                    <li>alt/option-click: toggle neuron on/off</li>
                                </ul>
                            </Modal.Body>
                        </Modal>
                        <NavItem onClick={() => this.setState({showTutorial: true})}
                                 style={{
                                     marginRight: "80px",
                                     textDecoration: "underline",
                                     fontSize: "14px",
                                     textAlign: "center"
                                 }}>
                            Tutorial Video
                        </NavItem>
                        <NavDropdown title="Examples - Try It Now!" key="nav-examples"
                                     style={{marginRight: "40px", textDecoration: "underline", fontSize: "14px"}}
                                     onSelect={(key) => this.onSelectExampleQuery(key)} id="nav-examples">
                            {menuItems}
                        </NavDropdown>
                        <NavItem href="https://www.janelia.org/project-team/mouselight" target="_blank"
                                 style={{marginRight: "40px"}}>
                            MouseLight Home
                        </NavItem>
                        <NavDropdown title="Help" key="nav-help" id="nav-help" style={{marginRight: "40px"}}
                                     onSelect={(key) => this.onSelectHelpMenuItem(key)}>
                            <MenuItem eventKey={null}
                                      href="https://www.janelia.org/project-team/mouselight/neuronbrowser"
                                      target="_blank">About</MenuItem>
                            <MenuItem eventKey={1}>Shortcuts</MenuItem>
                            <MenuItem eventKey={null} href="mailto:mouselightadmin@janelia.hhmi.org">Report an
                                Issue</MenuItem>
                            <MenuItem eventKey={null} href="mailto:mouselightadmin@hhmi.org">Contact Us</MenuItem>
                            <MenuItem eventKey={null}
                                      href="https://www.janelia.org/project-team/mouselight/neuronbrowser"
                                      target="_blank">Terms of Use</MenuItem>
                        </NavDropdown>
                        {PreferencesManager.HavePreferences ?
                            <NavItem onSelect={() => this.props.onSettingsClick()}>
                                <Glyphicon glyph="cog"/>
                            </NavItem> : null}
                    </Nav>
                    <Navbar.Text pullRight><Badge>{this.props.data.systemMessage}</Badge></Navbar.Text>
                </Navbar.Collapse>
            </Navbar>);
    }
}

export const HeadingWithData = graphql<ISystemMessageQuery, IHeadingProps>(SystemMessageQuery, {
    options: {
        pollInterval: 60000
    }
})(Heading);

