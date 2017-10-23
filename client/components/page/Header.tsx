import * as React from "react";
import {Link} from "react-router";
import {Navbar, Nav, Glyphicon, Badge, NavItem, NavDropdown, MenuItem, Modal} from "react-bootstrap"
import {graphql, QueryProps} from "react-apollo";

import {SystemMessageQuery} from "../../graphql/systemMessage";
import {PreferencesManager} from "../../util/preferencesManager";
import {examples} from "../../examples";

const logoImage = require("file-loader!../../../assets/mouseLight_NB_white.svg");

interface ISystemMessageQuery {
    systemMessage: string;
}

interface IHeadingProps {
    data?: QueryProps & ISystemMessageQuery;
    onSettingsClick(): void;
    onSetQuery(filterDatA: any): void;
}

interface IHeadingState {
    show?: boolean;
}

class Heading extends React.Component<IHeadingProps, IHeadingState> {
    public constructor(props: IHeadingProps) {
        super(props);

        this.state = {
            show: false
        }
    }

    private onSelectExampleQuery(eventKey: any) {
       this.props.onSetQuery(eventKey);
    }

    private onSelectHelpMenuItem(eventKey) {
        if (!eventKey) {
            return;
        }

        this.setState({show: true});
    }

    private onHide() {
        this.setState({show: false});
    }

    public render() {
        const menuItems = examples.map(s => {
            return (<MenuItem eventKey={s} key={s.name}>{s.name}</MenuItem>);
        });

        return (
            <Navbar fluid style={{borderRadius: 0, marginBottom: 0}}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">
                            <img src={logoImage}/>
                        </Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight style={{marginRight: "5px", paddingTop: "8px"}}>
                        <Modal show={this.state.show} onHide={() => this.onHide()} aria-labelledby="contained-modal-title-sm">
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
                        <NavDropdown title="Examples - Try It Now!" key="nav-examples" style={{marginRight: "40px", textDecoration: "underline", fontSize: "14px"}}
                                        onSelect={(key) => this.onSelectExampleQuery(key)} id="nav-examples">
                            {menuItems}
                        </NavDropdown>
                        <NavItem href="https://www.janelia.org/project-team/mouselight" target="_blank" style={{marginRight: "40px"}}>
                            MouseLight Home
                        </NavItem>
                        <NavDropdown title="Help" key="nav-help" id="nav-help"  style={{marginRight: "40px"}} onSelect={(key) => this.onSelectHelpMenuItem(key)}>
                            <MenuItem eventKey={null} href="https://www.janelia.org/project-team/mouselight" target="_blank">About</MenuItem>
                            <MenuItem eventKey={1}>Shortcuts</MenuItem>
                            <MenuItem eventKey={null} href="mailto:mouselightadmin@janelia.hhmi.org">Report an Issue</MenuItem>
                            <MenuItem eventKey={null} href="mailto:mouselightadmin@hhmi.org">Contact Us</MenuItem>
                            <MenuItem eventKey={null} href="https://www.janelia.org/project-team/mouselight" target="_blank">Terms of Use</MenuItem>
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

