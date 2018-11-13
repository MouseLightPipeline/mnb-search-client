import * as React from "react";
import {Menu, Icon, Image, Dropdown, MenuItem, Popup, Modal} from "semantic-ui-react";

import {PreferencesManager} from "../../util/preferencesManager";
import {ExampleDefinition, examples} from "../../examples";
import {TutorialDialog} from "./Tutorial";
import {SYSTEM_MESSAGE_QUERY, SystemMessageQuery} from "../../graphql/systemMessage";

const logo = require("file-loader!../../../assets/mouseLight_NB_color.svg");
const hhmiImage = require("file-loader!../../../assets/hhmi_logo.png");

interface IHeadingProps {
    onSettingsClick(): void;
    onApplyExampleQuery(filterData: ExampleDefinition): void;
}

interface IHeadingState {
    showShortcuts?: boolean;
    showTutorial?: boolean;
}

export class PageHeader extends React.Component<IHeadingProps, IHeadingState> {
    public constructor(props: IHeadingProps) {
        super(props);

        this.state = {
            showShortcuts: false,
            showTutorial: false
        }
    }

    private onSelectExampleQuery(example: ExampleDefinition) {
        this.props.onApplyExampleQuery(example);
    }

    private onShowShortcuts() {
        this.setState({showShortcuts: true});
    }

    private onHideShortcuts() {
        this.setState({showShortcuts: false});
    }

    private onHideTutorial() {
        this.setState({showTutorial: false});
    }

    public render() {
        const exampleMenuItems = examples.map(s => {
            return (<Dropdown.Item key={s.name} onClick={() => this.onSelectExampleQuery(s)}>{s.name}</Dropdown.Item>);
        });

        let message = null;

        const helpItems = [
            <Dropdown.Item key={"1"} href="https://www.janelia.org/project-team/mouselight/neuronbrowser"
                           target="_blank">
                About
            </Dropdown.Item>,
            <Dropdown.Item key={"2"} onClick={() => this.onShowShortcuts()}>
                Shortcuts
            </Dropdown.Item>,
            <Dropdown.Item key={"3"} href="mailto:mouselightadmin@janelia.hhmi.org">
                Report an Issue
            </Dropdown.Item>,
            <Dropdown.Item key={"4"} href="mailto:mouselightadmin@hhmi.org">
                Contact Us
            </Dropdown.Item>,
            <Dropdown.Item key={"5"} href="https://www.janelia.org/project-team/mouselight/neuronbrowser"
                           target="_blank">
                Terms of Use
            </Dropdown.Item>
        ];

        return (
            <SystemMessageQuery query={SYSTEM_MESSAGE_QUERY} pollInterval={10000}>
                {({loading, error, data}) => {
                    if (data && data.systemSettings) {
                        switch (data.systemSettings.release.toLowerCase()) {
                            case "internal":
                                message =
                                    <Popup trigger={<span>INTERNAL INSTANCE (MAY INCLUDE NON-PUBLIC CONTENTS)</span>}
                                           flowing={true}
                                           content="This instance set includes any tracing marked public or internal that have been transitioned to this optimized search instance. This may not include recently transformed tracings."/>;
                                break;
                            case "team":
                                message = <Popup trigger={<span>TEAM INSTANCE (NON-PUBLIC/NON-INTERNAL CONTENTS)</span>}
                                                 flowing={true}
                                                 content="This instance set includes all uploaded tracings.  New tracings are available immediately after the transform completes."/>;
                                break;
                        }
                    }

                    return (
                        <Menu inverted stackable borderless={true}
                              style={{margin: 0, borderRadius: 0, height: "79px"}}>
                            {this.state.showTutorial ? <TutorialDialog show={this.state.showTutorial}
                                                                       onHide={() => this.onHideTutorial()}/> : null}
                            <Modal open={this.state.showShortcuts} onClose={() => this.onHideShortcuts()}>
                                <Modal.Header closeButton content="Viewer Shortcuts"/>
                                <Modal.Content>
                                    <ul>
                                        <li>ctrl-click: snap to position</li>
                                        <li>shift-click: add neuron to selection</li>
                                        <li>alt/option-click: toggle neuron on/off</li>
                                    </ul>
                                </Modal.Content>
                            </Modal>

                            <Menu.Item fitted="horizontally" as="a" style={{maxWidth: "214px"}}
                                       href="https://www.janelia.org/project-team/mouselight/neuronbrowser">
                                <Image size="medium" src={logo}/>
                            </Menu.Item>
                            <Menu.Item fitted="horizontally" style={{margin: "0 40px"}}>
                                {message ||
                                <a href="http://www.janelia.org" target="_blank" style={{maxWidth: "214px"}}>
                                    <Image size="small" src={hhmiImage}/>
                                </a>}
                            </Menu.Item>

                            <Menu.Menu position="right" style={{height: "79px"}}>
                                <MenuItem onClick={() => this.setState({showTutorial: true})}>
                                    Tutorial Video
                                </MenuItem>
                                <Dropdown item text="Examples - Try It Now!">
                                    <Dropdown.Menu>
                                        {exampleMenuItems}
                                    </Dropdown.Menu>
                                </Dropdown>
                                <MenuItem as="a" href="http://mouselight.janelia.org" target="_blank">
                                    MouseLight Home
                                </MenuItem>
                                <Dropdown item text="Help">
                                    <Dropdown.Menu>
                                        {helpItems}
                                    </Dropdown.Menu>
                                </Dropdown>

                                {PreferencesManager.HavePreferences ?
                                    <MenuItem onClick={() => this.props.onSettingsClick()}>
                                        <Icon name="cog"/>
                                    </MenuItem> : null}
                            </Menu.Menu>
                        </Menu>
                    );

                    /*
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
                                            <Icon name="cog"/>
                                        </NavItem> : null}
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>);
                        */
                }}
            </SystemMessageQuery>
        );
    }
}
