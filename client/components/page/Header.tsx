import * as React from "react";
import {Navbar, Nav, Glyphicon, Popover, NavItem, NavDropdown, MenuItem, Modal, OverlayTrigger} from "react-bootstrap"

import {PreferencesManager} from "../../util/preferencesManager";
import {ExampleDefinition, examples} from "../../examples";
import {TutorialDialog} from "./Tutorial";
import {SYSTEM_MESSAGE_QUERY, SystemMessageQuery} from "../../graphql/systemMessage";

const logoImagelg = require("file-loader!../../../assets/mouseLight_NB_color.svg");
const hhmiImage = require("file-loader!../../../assets/hhmi_logo.png");

interface IHeadingProps {
    onSettingsClick(): void;
    onApplyExampleQuery(filterData: ExampleDefinition): void;
}

interface IHeadingState {
    showSettings?: boolean;
    showTutorial?: boolean;
}

export class PageHeader extends React.Component<IHeadingProps, IHeadingState> {
    public constructor(props: IHeadingProps) {
        super(props);

        this.state = {
            showSettings: false,
            showTutorial: false
        }
    }

    private onSelectExampleQuery(eventKey: any) {
        this.props.onApplyExampleQuery(eventKey);
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

        let message = null;
        let popover = null;

        return (
            <SystemMessageQuery query={SYSTEM_MESSAGE_QUERY} pollInterval={10000}>
                {({loading, error, data}) => {
                    if (data && data.systemSettings) {
                        switch (data.systemSettings.release.toLowerCase()) {
                            case "internal":
                                popover = (
                                    <Popover id="foo1" title="Data">This instance set includes any tracing marked public or internal
                                        that have been
                                        transitioned to this optimized search instance. This may not include recently transformed
                                        tracings.</Popover>);
                                message = "INTERNAL INSTANCE (MAY INCLUDE NON-PUBLIC CONTENTS)";
                                break;
                            case "team":
                                popover = (
                                    <Popover id="foo2" title="Data">This instance set includes all uploaded tracings. New tracings
                                        are available immediately after the transform completes.</Popover>);
                                message = "TEAM INSTANCE (NON-PUBLIC/NON-INTERNAL CONTENTS)";
                                break;
                        }
                    }

                    return (
                        <Navbar inverse={true} fluid style={{borderRadius: 0, marginBottom: 0}}>
                            <Navbar.Header>
                                <Navbar.Brand id="brand">
                                    <a href="https://www.janelia.org/project-team/mouselight/neuronbrowser">
                                        <img id="logolg" src={logoImagelg} height={52}/></a>
                                </Navbar.Brand>
                                <Navbar.Toggle/>
                            </Navbar.Header>
                            <Navbar.Collapse>
                                {message === null ?
                                    <Nav id="janelia">
                                        <NavItem href="http://www.janelia.org" target="_blank">
                                            <img src={hhmiImage} height={48} style={{order: 2, marginLeft: "30px"}}/>
                                        </NavItem>
                                    </Nav> : null}
                                {message !== null ?
                                    <Nav style={{paddingTop: "18px"}}>
                                        <NavItem>
                                            <OverlayTrigger trigger={["hover", "focus"]} placement="right"
                                                            overlay={popover}>
                                                <span>{message}</span>
                                            </OverlayTrigger>
                                        </NavItem>
                                    </Nav> : null}
                                <Nav pullRight style={{paddingTop: "18px"}}>
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
                                    <NavItem onClick={() => this.setState({showTutorial: true})} id="tutorial-nav"
                                             style={{textDecoration: "underline", fontSize: "14px"}}>
                                        Tutorial Video
                                    </NavItem>
                                    <NavDropdown title="Examples - Try It Now!" key="nav-examples"
                                                 style={{textDecoration: "underline", fontSize: "14px"}}
                                                 onSelect={(key) => this.onSelectExampleQuery(key)} id="nav-examples">
                                        {menuItems}
                                    </NavDropdown>
                                    <NavItem href="http://mouselight.janelia.org" target="_blank">
                                        MouseLight Home
                                    </NavItem>
                                    <NavDropdown title="Help" key="nav-help" id="nav-help"
                                                 onSelect={(key) => this.onSelectHelpMenuItem(key)}>
                                        <MenuItem eventKey={null}
                                                  href="https://www.janelia.org/project-team/mouselight/neuronbrowser"
                                                  target="_blank">About</MenuItem>
                                        <MenuItem eventKey={1}>Shortcuts</MenuItem>
                                        <MenuItem eventKey={null} href="mailto:mouselightadmin@janelia.hhmi.org">Report
                                            an
                                            Issue</MenuItem>
                                        <MenuItem eventKey={null} href="mailto:mouselightadmin@hhmi.org">Contact
                                            Us</MenuItem>
                                        <MenuItem eventKey={null}
                                                  href="https://www.janelia.org/project-team/mouselight/neuronbrowser"
                                                  target="_blank">Terms of Use</MenuItem>
                                    </NavDropdown>
                                    {PreferencesManager.HavePreferences ?
                                        <NavItem onSelect={() => this.props.onSettingsClick()}>
                                            <Glyphicon glyph="cog"/>
                                        </NavItem> : null}
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>);
                }}
            </SystemMessageQuery>
        );
    }
}
