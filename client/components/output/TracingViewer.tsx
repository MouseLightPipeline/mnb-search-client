import * as React from "react";
import * as _ from "lodash";

import {ITracingNode} from "../../models/tracingNode";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {NdbConstants} from "../../models/constants";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";
import {IPositionInput} from "../../models/queryFilter";
import {ViewerMouseHandler} from "../../viewer/viewMouseHandler";
import {SharkViewer} from "../../shark_viewer";
import {ViewerSelection} from "./ViewerSelection";
import {INotificationListener, PreferencesManager} from "../../util/preferencesManager";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NeuronViewMode} from "../../viewmodel/neuronViewMode";

const ROOT_ID = 997;

export enum HighlightSelectionMode {
    Normal,
    Cycle
}

export interface ITiming {
    total: number;
    load: number;
    map: number;
    transfer: number;
}

export interface ITracingViewerProps {
    constants: NdbConstants;
    compartments: BrainCompartmentViewModel[];
    tracings: TracingViewModel[];
    isLoading: boolean;
    isRendering: boolean;
    fixedAspectRatio?: number;
    displayHighlightedOnly: boolean;
    highlightSelectionMode: HighlightSelectionMode;
    cycleFocusNeuronId: string;

    onChangeIsRendering?(isRendering: boolean): void;
    onHighlightTracing(neuron: NeuronViewModel, highlight?: boolean): void;
    onSelectNode?(tracing: TracingViewModel, node: ITracingNode): void;
    onToggleTracing(id: string): void;
    onToggleCompartment(id: string): void;
    onToggleDisplayHighlighted(): void;
    onChangeHighlightMode(): void;
    onSetHighlightedNeuron(neuron: NeuronViewModel): void;
    onCycleHighlightNeuron(direction: number): void;
    populateCustomPredicate(position: IPositionInput, replace: boolean): void;
    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

interface ITracingViewerState {
    renderWidth?: number;
    renderHeight?: number;

    selectedTracing?: TracingViewModel;
    selectedNode?: ITracingNode;
}

export class TracingViewer extends React.Component<ITracingViewerProps, ITracingViewerState> implements INotificationListener {
    private _viewer: any = null;

    private _loadedVolumes: string[] = [];
    private _knownVolumes = new Set<string>();

    private _loadedNeurons: string[] = [];
    private _knownNeurons = new Set<string>();

    private _neuronColors = new Map<string, string>();

    private _tracingRadiusFactor = PreferencesManager.Instance.TracingRadiusFactor;


    public constructor(props: ITracingViewerProps) {
        super(props);

        this.state = {
            renderWidth: 0,
            renderHeight: 0,
            selectedTracing: null,
            selectedNode: null
        }
    }

    private lookupBrainArea(id: string | number) {
        return this.props.constants.findBrainArea(id);
    }

    public componentDidMount() {
        this.updateDimensions();

        window.addEventListener("resize", () => this.updateDimensions());

        PreferencesManager.Instance.addListener(this);

        this.prepareAndRenderTracings(this.props);
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", () => this.updateDimensions());

        PreferencesManager.Instance.removeListener(this);
    }

    public componentWillReceiveProps(props: ITracingViewerProps) {
        this.prepareAndRenderTracings(props);

        this.updateDimensions();
    }

    public preferenceChanged(name: string, value: any) {
        if (name === "viewerBackgroundColor") {
            if (this._viewer) {
                this._viewer.setBackground(parseInt(value.slice(1), 16));
            }
        }
    }

    public reset() {
        if (this._viewer) {
            this._viewer.onResetView(0, 0);
        }
        this.setState({selectedNode: null, selectedTracing: null});
    }

    public resetView(r1, r2) {
        if (this._viewer) {
            this._viewer.onResetView(r1, r2);
        }
    }

    private onToggleDisplayHighlighted() {
        //this._displayHighlightedOnly = !this._displayHighlightedOnly;

        //this.prepareAndRenderTracings(this.props);
        this.props.onToggleDisplayHighlighted();
    }

    private createViewer(width: number, height: number) {
        if (!this._viewer) {
            const s = new SharkViewer();

            s.swc = null;
            s.mode = "particle";
            s.dom_element = "viewer-container";
            s.centerpoint = [6688, 3849, 5687];
            s.metadata = false;
            s.compartment_path = "public/allen/obj/";
            s.WIDTH = width;
            s.HEIGHT = height;
            s.on_select_node = (tracingId: string, sampleNumber: number, event) => this.onSelectNode(tracingId, sampleNumber, event);
            s.on_toggle_node = (tracingId: string, sampleNumber: number) => this.props.onToggleTracing(tracingId);

            s.init();
            s.setBackground(parseInt(PreferencesManager.Instance.ViewerBackgroundColor.slice(1), 16));

            s.animate();

            s.addEventHandler(new ViewerMouseHandler());

            this._viewer = s;
        }
    }

    private calculateDimensions() {
        const container = document.getElementById("viewer-parent");

        if (!container) {
            return {width: 0, height: 0};
        }

        let width = container.clientWidth;
        let height = container.clientHeight;

        if (this.props.fixedAspectRatio) {
            width = Math.min(width, height * this.props.fixedAspectRatio);

            const aspectRatio = width / height;

            if (aspectRatio > this.props.fixedAspectRatio) {
                // constrained by height
                width = this.props.fixedAspectRatio * height;
            } else {
                // constrained by width
                height = width / this.props.fixedAspectRatio;
            }
        }

        return {width, height};
    }

    private updateDimensions() {
        const {width, height} = this.calculateDimensions();

        this.setState({renderWidth: width, renderHeight: height});

        if (this._viewer) {
            this._viewer.setSize(width, height);
        }
    }

    private renderBrainVolumes(props: ITracingViewerProps) {
        if (!this._viewer) {
            return;
        }

        const displayCompartments = props.compartments.filter(c => c.isDisplayed);

        if (displayCompartments.length === 0) {
            this._loadedVolumes.map(id => {
                this._viewer.setCompartmentVisible(id, false);
            });
        } else if (this._loadedVolumes.length === 0) {
            displayCompartments.map(v => {
                if (this._knownVolumes.has(v.compartment.id)) {
                    this._viewer.setCompartmentVisible(v.compartment.id, true);
                } else {
                    let geometryColor = v.compartment.geometryColor;
                    if (v.compartment.structureId === ROOT_ID) {
                        geometryColor = PreferencesManager.Instance.RootCompartmentColor;
                    }
                    this._viewer.loadCompartment(v.compartment.id, v.compartment.geometryFile, geometryColor);
                    this._knownVolumes.add(v.compartment.id);
                }
            });
        } else {
            const compartmentsToDisplayIds = displayCompartments.map(c => c.compartment.id);

            const unChanged = _.intersection(this._loadedVolumes, compartmentsToDisplayIds);

            const toUnload = _.difference(this._loadedVolumes, unChanged);

            const toLoad = _.difference(compartmentsToDisplayIds, unChanged);

            toUnload.map(id => {
                // const brainArea = this.lookupBrainArea(v);
                // this._viewer.unloadCompartment(brainArea.geometryFile)
                this._viewer.setCompartmentVisible(id, false);
            });

            toLoad.map(id => {
                if (this._knownVolumes.has(id)) {
                    this._viewer.setCompartmentVisible(id, true);
                } else {
                    const brainArea = this.lookupBrainArea(id);
                    if (brainArea.structureId === ROOT_ID) {
                        brainArea.geometryColor = PreferencesManager.Instance.RootCompartmentColor;
                    }
                    this._viewer.loadCompartment(id, brainArea.geometryFile, brainArea.geometryColor);
                    this._knownVolumes.add(id);
                }
            });
        }

        this._loadedVolumes = displayCompartments.map(c => c.compartment.id);
    }

    private createNeuron(tracing: TracingViewModel, fadedOpacity: number) {
        const nodes: any = {};

        if (tracing.IsSomaOnly) {
            const node = tracing.soma;

            // Can happen before data is loaded.
            if (!node) {
                return;
            }

            nodes[node.sampleNumber] = {
                alpha: 1.0,
                sampleNumber: node.sampleNumber,
                type: 0,
                x: node.x,
                y: node.y,
                z: node.z,
                radius: Math.min(40, node.radius * 40) * this._tracingRadiusFactor,
                parent: node.parentNumber
            };
        } else {
            // Can happen during transition from soma view mode to tracing, before data is loaded.
            if (!tracing.tracing) {
                return;
            }

            let mapNodes = false;

            if (!tracing.nodeLookup) {
                tracing.nodeLookup = new Map<number, ITracingNode>();
                mapNodes = true;
            }

            tracing.tracing.nodes.forEach(node => {
                if (node) {
                    nodes[node.sampleNumber] = {
                        sampleNumber: node.sampleNumber,
                        type: 0,
                        x: node.x,
                        y: node.y,
                        z: node.z,
                        radius: 4 * this._tracingRadiusFactor,
                        parent: node.parentNumber
                    };

                    if (mapNodes) {
                        tracing.nodeLookup.set(node.sampleNumber, node);
                    }
                }
            });
        }

        this._neuronColors.set(tracing.id, tracing.neuron.baseColor);

        this._viewer.loadNeuron(tracing.id, tracing.neuron.baseColor, nodes);

        this.setOpacity(tracing, fadedOpacity);

        this._knownNeurons.add(tracing.id);
    }

    private verifyNeuron(tracing: TracingViewModel, fadedOpacity: number) {
        const matches = this._neuronColors.get(tracing.id) === tracing.neuron.baseColor;

        if (matches) {
            this.setOpacity(tracing, fadedOpacity);
        } else {
            this._viewer.unloadNeuron(tracing.id);
            this._knownNeurons.delete(tracing.id);
            this.createNeuron(tracing, fadedOpacity);
        }

        return matches;
    }

    private setOpacity(tracing: TracingViewModel, fadedOpacity: number) {
        if (this.props.highlightSelectionMode === HighlightSelectionMode.Normal) {
            this._viewer.setNeuronDisplayLevel(tracing.id, !this.props.displayHighlightedOnly || tracing.IsHighlighted ? 1.0 : fadedOpacity);
        } else {
            if (tracing.NeuronId === this.props.cycleFocusNeuronId) {
                this._viewer.setNeuronDisplayLevel(tracing.id, 1.0);
            } else {
                this._viewer.setNeuronDisplayLevel(tracing.id, tracing.IsHighlighted ? 0.1 : fadedOpacity);
            }
        }
    }

    private renderNeurons(tracings: TracingViewModel[]) {
        if (tracings === null || this._viewer === null) {
            return; // Loading, not ready, etc.  Don't change current appearance.
        }

        if (tracings.length === 0) {
            this._loadedNeurons.map(id => {
                this._viewer.setNeuronVisible(id, false);
            });
            this._loadedNeurons = [];

            return;
        }

        const highlightValue = PreferencesManager.Instance.TracingSelectionHiddenOpacity;

        const knownAsArray = Array.from(this._knownNeurons);

        // On screen, but should not be.
        const toHide = _.differenceWith(this._loadedNeurons, tracings, (id, tracing) => id === tracing.id);

        // Never seen and must create and show
        const toCreate = _.differenceWith(tracings, knownAsArray, (tracing, id) => id === tracing.id);

        // Know, but may have changed.
        const toVerify = _.intersectionWith(tracings, knownAsArray, (tracing, id) => id === tracing.id);

        toVerify.map(obj => {
            this.verifyNeuron(obj, highlightValue);
        });

        toCreate.map(obj => {
            this.createNeuron(obj, highlightValue);
        });

        toHide.map(id => {
            this._viewer.setNeuronVisible(id, false);
        });

        this._loadedNeurons = tracings.map(t => t.id);
    }

    private prepareAndRenderTracings(props: ITracingViewerProps) {
        if (!this.props.isRendering) {
            this.props.onChangeIsRendering(true);
        }

        // Allows the above change in props to be reflected in the UI before performing render.
        setTimeout(() => this.loadTracings(props), 0.01);
    }

    private loadTracings(props: ITracingViewerProps) {
        const {width, height} = this.calculateDimensions();

        this.createViewer(width, height);

        this.renderBrainVolumes(props);

        this.renderNeurons(props.tracings);

        this.props.onChangeIsRendering(false);
    }

    private onRemoveActiveTracing(neuron: NeuronViewModel) {
        this.props.onHighlightTracing(neuron, false);
    }

    private onSelectNode(tracingId: string, sampleNumber: number, event) {
        if (!this.props.tracings) {
            return;
        }

        const tracings = this.props.tracings.filter(t => t.id == tracingId);

        if (tracings.length > 0) {
            const tracing = tracings[0];

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
                        this.setState({selectedTracing: tracing, selectedNode: node});

                        if (this.props.onSelectNode) {
                            this.props.onSelectNode(tracing, node);
                        }
                    }
                } else {
                    this.props.onHighlightTracing(tracing.neuron);
                }
            }
        }
    }

    public render() {
        const activeNeurons = _.uniqBy(this.props.tracings.map(t => t.neuron).filter(n => n.isInHighlightList), "IdOrDoi");

        const style = Object.assign({
            height: "100%",
            width: "100%",
            position: relative
        }, PreferencesManager.Instance.HideCursorInViewer ? {cursor: "none"} : {});

        return (
            <div id="viewer-parent" style={style}>
                <ViewerSelection constants={this.props.constants}
                                 selectedNode={this.state.selectedNode}
                                 selectedTracing={this.state.selectedTracing}
                                 displayHighlightedOnly={this.props.displayHighlightedOnly}
                                 highlightSelectionMode={this.props.highlightSelectionMode}
                                 cycleFocusNeuronId={this.props.cycleFocusNeuronId}
                                 activeNeurons={activeNeurons}
                                 onChangeNeuronViewMode={this.props.onChangeNeuronViewMode}
                                 onRemoveActiveTracing={(n) => this.onRemoveActiveTracing(n)}
                                 onToggleTracing={this.props.onToggleTracing}
                                 onToggleLimitToHighlighted={() => this.onToggleDisplayHighlighted()}
                                 onToggleLoadedGeometry={this.props.onToggleCompartment}
                                 onChangeHighlightMode={() => this.props.onChangeHighlightMode()}
                                 onSetHighlightedNeuron={(n: NeuronViewModel) => this.props.onSetHighlightedNeuron(n)}
                                 onCycleHighlightNeuron={(d: number) => this.props.onCycleHighlightNeuron(d)}
                                 populateCustomPredicate={this.props.populateCustomPredicate}/>
                <div id="viewer-container" style={{height: this.state.renderHeight, width: this.state.renderWidth}}/>
            </div>
        );
    }
}

const relative: "relative" = "relative";
