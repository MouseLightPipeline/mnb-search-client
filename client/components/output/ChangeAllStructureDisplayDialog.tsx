import * as React from "react";
import {Modal, Button} from "react-bootstrap"
import {NEURON_VIEW_MODES, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {TracingViewModeSelect} from "../editors/TracingViewModeSelect";

interface IChangeAllStructureDisplayDialogProps {
    show: boolean
    defaultStructureSelection: NeuronViewMode;

    onCancel(): void;
    onAccept(mode: NeuronViewMode): void;
}

interface IChangeAllStructureDisplayDialogState {
    structureSelection: NeuronViewMode;
}

export class ChangeAllStructureDisplayDialog extends React.Component<IChangeAllStructureDisplayDialogProps, IChangeAllStructureDisplayDialogState> {
    public constructor(props: IChangeAllStructureDisplayDialogProps) {
        super(props);

        this.state = {structureSelection: props.defaultStructureSelection};
    }
    private onViewModeChange(viewMode: NeuronViewMode) {
        this.setState({structureSelection: viewMode});
    }

    public render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onCancel} aria-labelledby="contained-modal-title-sm">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-sm">Set Display Structures</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Update the all neurons to display
                    <TracingViewModeSelect idName="view-mode"
                                           options={NEURON_VIEW_MODES}
                                           placeholder="any"
                                           clearable={false}
                                           searchable={false}
                                           selectedOption={this.state.structureSelection}
                                           onSelect={(v: NeuronViewMode) => this.onViewModeChange(v)}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsSize="small" onClick={this.props.onCancel}>Cancel</Button>
                    <Button bsSize="small" bsStyle="success" onClick={() => this.props.onAccept(this.state.structureSelection)}>Ok</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
