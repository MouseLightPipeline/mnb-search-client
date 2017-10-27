import * as React from "react";
import {Modal} from "react-bootstrap"

const movie = require("file-loader!../../../assets/final_new.mp4");

interface ITutorialProps {
    show: boolean

    onHide(): void;
}

interface ITutorialState {
}

export class TutorialDialog extends React.Component<ITutorialProps, ITutorialState> {
    public render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}  id="tutorial_modal" aria-labelledby="contained-modal-title-sm"
                   bsSize="large">
                <Modal.Body>
                    <video id="tutorial" controls>
                        <source
                            src={movie}
                            type="video/mp4"/>
                    </video>
                </Modal.Body>
            </Modal>
        );
    }
}
