import {action, autorun, observable, observe} from "mobx";

import {SharkViewer} from "../../viewer/shark_viewer";
import {PreferencesManager} from "../../util/preferencesManager";
import {ViewerMouseHandler} from "../../viewer/viewMouseHandler";
import {SliceManager} from "../../tomography/sliceManager";
import {CompartmentManager} from "../../viewer/compartmentManager";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {ITracingNode} from "../../models/tracingNode";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {HighlightSelectionMode} from "../../components/output/TracingViewer";
import {TomographyViewModel} from "./tomographyViewModel";
import {CompartmentsViewModel} from "./compartment/compartmentsViewModel";
import {SlicePlane} from "../../services/sliceService";
import {TracingManager} from "../../viewer/tracings/tracingManager";

const tomographyConstants = TomographyConstants.Instance;

export class ViewerViewModel {
    @observable public neuronViewModels = observable.array<NeuronViewModel>([]);

    @observable public Tracings = observable.array<TracingViewModel>([]);

    @observable public selectedNeurons = observable.array<NeuronViewModel>([]);

    @observable public SelectedTracing: TracingViewModel = null;

    @observable public SelectedNode: ITracingNode = null;

    @observable public highlightSelectionMode: HighlightSelectionMode = HighlightSelectionMode.Normal;

    @observable public displayHighlightedOnly: boolean = false;

    @observable public wasDisplayHighlightedOnly: boolean = false;

    @observable public cycleFocusNeuronId: string = null;

    @observable public IsAttached: boolean = false;

    public viewer: SharkViewer = null;

    private _sliceManager = null;
    private _compartmentManager = null;
    private _tracingManager = null;

    private readonly _tomography: TomographyViewModel;
    private readonly _compartments: CompartmentsViewModel;

    public constructor(tomography: TomographyViewModel, compartments: CompartmentsViewModel) {
        this._tomography = tomography;
        this._compartments = compartments;
    }

    public async attach(name: string, width: number, height: number) {
        this.viewer = new SharkViewer();

        // s.ElementName = "viewer-container";
        this.viewer.CenterPoint = [tomographyConstants.Sagittal.Center, tomographyConstants.Horizontal.Center, tomographyConstants.Coronal.Center];
        this.viewer.OnSelectNode = (tracingId: string, sampleNumber: number, event) => this.onSelectNode(tracingId, sampleNumber, event);
        // s.OnToggleNode = (tracingId: string) => this.props.onToggleTracing(tracingId);

        this.viewer.init(width, height);
        this.viewer.setBackground(parseInt(PreferencesManager.Instance.ViewerBackgroundColor.slice(1), 16));

        this.viewer.animate();

        this.viewer.addEventHandler(new ViewerMouseHandler(), "viewer-container");

        await this.registerTomographyManagement();

        this.registerCompartmentManagement();

        this.viewer.attach("viewer-container");

        this.IsAttached = true;
    }

    @action
    public resetPage() {
        this.displayHighlightedOnly = false;
        this.highlightSelectionMode = HighlightSelectionMode.Normal;
        this.SelectedNode = null;
        this.SelectedTracing = null;

        this.resetView(0, 0);

        // TODO reset tomography
    }

    @action resetView(r1: number, r2: number) {
        this.viewer?.onResetView(r1, r2);
    }

    @action
    private onSelectNode(tracingId: string, sampleNumber: number, event) {
        const tracing = this.Tracings.find(t => t.id == tracingId);

        if (tracing != null) {
            let node = null;

            if (tracing.nodeLookup) {
                node = tracing.nodeLookup.get(sampleNumber);
            } else {
                // Only the soma has been loaded.
                node = tracing.soma;
            }

            if (!event.ctrlKey && !event.altKey) {
                if (!event.shiftKey) {
                    if (node) {
                        // this.setState({selectedTracing: tracing, selectedNode: node});
                        this.SelectedTracing = tracing;
                        this.SelectedNode = node;

                        /*
                        if (this.props.onSelectNode) {
                            this.props.onSelectNode(tracing, node);
                        }
                         */
                    }
                } else {
                    this.onChangeHighlightTracing(tracing.neuron);
                }
            }
        }
    }

    @action
    public onChangeHighlightTracing(neuronViewModel: NeuronViewModel, shouldHighlight: boolean = null) {
        neuronViewModel.isInHighlightList = shouldHighlight == null ? !neuronViewModel.isInHighlightList : shouldHighlight;

        if (neuronViewModel.isInHighlightList && !this.selectedNeurons.includes(neuronViewModel)) {
            this.selectedNeurons.push(neuronViewModel);
        } else if (this.selectedNeurons.includes(neuronViewModel)) {
            this.selectedNeurons.remove(neuronViewModel);
        }

        this.verifyHighlighting();
    }

    @action
    public onToggleDisplayHighlighted() {
        this.displayHighlightedOnly = !this.displayHighlightedOnly;
    }

    @action
    public onSetHighlightedNeuron(neuron: NeuronViewModel) {
        this.cycleFocusNeuronId = neuron.Id;
    }

    @action
    public onCycleHighlightNeuron(direction: number) {
        const highlighted = this.neuronViewModels.filter(n => n.isInHighlightList).map(n => n.neuron.id);

        if (highlighted.length < 2) {
            return;
        }

        if (this.cycleFocusNeuronId === null) {
            if (highlighted.length > 0) {
                this.cycleFocusNeuronId = highlighted[0];
            }
        } else {
            const index = highlighted.indexOf(this.cycleFocusNeuronId);

            if (direction < 0) {
                if (index > 0) {
                    this.cycleFocusNeuronId = highlighted[index - 1];
                } else {
                    this.cycleFocusNeuronId = highlighted[length - 1];
                }
            } else {
                if (index < highlighted.length - 1) {
                    this.cycleFocusNeuronId = highlighted[index + 1];
                } else {
                    this.cycleFocusNeuronId = highlighted[0];
                }
            }
        }
    }

    @action
    public onChangeHighlightMode() {
        this.wasDisplayHighlightedOnly = this.displayHighlightedOnly;

        this.highlightSelectionMode = this.highlightSelectionMode === HighlightSelectionMode.Normal ? HighlightSelectionMode.Cycle : HighlightSelectionMode.Normal;

        this.cycleFocusNeuronId = null;

        if (this.highlightSelectionMode === HighlightSelectionMode.Cycle) {
            const active = this.neuronViewModels.find(n => n.isInHighlightList);

            if (active) {
                this.cycleFocusNeuronId = active.neuron.id;
            }

            this.displayHighlightedOnly = true;
        } else {
            this.displayHighlightedOnly = this.wasDisplayHighlightedOnly;
            this.cycleFocusNeuronId = null;
        }
    }

    // TODO private
    public verifyHighlighting() {
        if (this.highlightSelectionMode === HighlightSelectionMode.Cycle) {
            const highlighted = this.neuronViewModels.filter(n => n.isInHighlightList).map(n => n.neuron.id);

            if (this.cycleFocusNeuronId === null || !highlighted.some(id => id === this.cycleFocusNeuronId)) {
                if (highlighted.length > 0) {
                    this.cycleFocusNeuronId = highlighted[0];
                } else {
                    this.highlightSelectionMode = HighlightSelectionMode.Normal;
                }
            }
        }
    }

    private registerTracingManagement() {
        this._tracingManager = new TracingManager(this.viewer);

        observe(this.Tracings, () => {
            this._tracingManager.renderTracings(this.Tracings);
        });

        this._tracingManager.renderTracings(this.Tracings);
    }

    private registerCompartmentManagement() {
        this._compartmentManager = new CompartmentManager("/static/allen/obj/", this.viewer);

        observe(this._compartments.VisibleCompartments, () => {
            this._compartmentManager.renderCompartments(this._compartments.VisibleCompartments);
        });

        this._compartmentManager.renderCompartments(this._compartments.VisibleCompartments);
    }

    private async registerTomographyManagement() {
        this._sliceManager = new SliceManager(this.viewer.Scene);

        observe(this._tomography.Sagittal, async (change) => {
            switch (change.name) {
                case "IsEnabled":
                    await this.setSliceVisible(SlicePlane.Sagittal, this._tomography.Sagittal.IsEnabled);
                    break;
                case "Location":
                    await this._sliceManager.updateSlice(SlicePlane.Sagittal, this._tomography.Sagittal.Location);
                    break;
            }
        });

        observe(this._tomography.Horizontal, async (change) => {
            switch (change.name) {
                case "IsEnabled":
                    await this.setSliceVisible(SlicePlane.Horizontal, this._tomography.Horizontal.IsEnabled);
                    break;
                case "Location":
                    await this._sliceManager.updateSlice(SlicePlane.Horizontal, this._tomography.Horizontal.Location);
                    break;
            }
        });

        observe(this._tomography.Coronal, async (change) => {
            switch (change.name) {
                case "IsEnabled":
                    await this.setSliceVisible(SlicePlane.Coronal, this._tomography.Coronal.IsEnabled);
                    break;
                case "Location":
                    await this._sliceManager.updateSlice(SlicePlane.Coronal, this._tomography.Coronal.Location);
                    break;
            }
        });

        autorun(async () => {
            if (this._tomography.Selection) {
                await this._sliceManager.setSampleId(this._tomography.Selection.SampleTomography.Id, this._tomography.CurrentLocation);

                await this.registerTomographySelectionObservers();

                await this._sliceManager.setThreshold(this._tomography.Selection.UseCustomThreshold ? this._tomography.Selection.CustomThreshold.Values : null, this._tomography.CurrentLocation);
            }
        });

        await this.registerTomographySelectionObservers();

        if (this._tomography.Selection) {
            await this._sliceManager.setSampleId(this._tomography.Selection.SampleTomography.Id, this._tomography.CurrentLocation);
        }
    }

    private _tomographyDisposer1 = null;
    private _tomographyDisposer2 = null;

    private async registerTomographySelectionObservers() {
        if (this._tomographyDisposer1) {
            this._tomographyDisposer1();
            this._tomographyDisposer1 = null;
        }

        if (this._tomographyDisposer2) {
            this._tomographyDisposer2();
            this._tomographyDisposer2 = null;
        }

        if (this._tomography.Selection != null) {
            this._tomographyDisposer1 = observe(this._tomography.Selection, async () => {
                if (this._tomography.Selection) {
                    await this._sliceManager.setThreshold(this._tomography.Selection.UseCustomThreshold ? this._tomography.Selection.CustomThreshold.Values : null, this._tomography.CurrentLocation)
                }
            });

            this._tomographyDisposer2 = observe(this._tomography.Selection.CustomThreshold, async () => {
                if (this._tomography.Selection) {
                    await this._sliceManager.setThreshold(this._tomography.Selection.UseCustomThreshold ? this._tomography.Selection.CustomThreshold.Values : null, this._tomography.CurrentLocation)
                }
            });
        }
    }

    private async setSliceVisible(plane: SlicePlane, visible: boolean) {
        if (visible) {
            await this._sliceManager.showSlice(plane);
        } else {
            this._sliceManager.hideSlice(plane);
        }
    }
}
