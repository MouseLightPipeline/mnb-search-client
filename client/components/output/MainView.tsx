import * as React from "react";
import {observer} from "mobx-react";
import * as _ from "lodash";

import {ExportFormat, ITracing} from "../../models/tracing";
import {ITiming} from "./TracingViewer";

import "../../util/override.css";
import {INeuron} from "../../models/neuron";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {jet} from "../../util/colors";
import {NEURON_VIEW_MODE_SOMA, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {TracingStructure, TracingStructures} from "../../models/tracingStructure";
import {NdbConstants} from "../../models/constants";
import {IPositionInput} from "../../models/queryFilter";
import {INeuronListContainerProps, NeuronListContainer} from "./NeuronListContainer";
import {IViewerProps, ViewerContainer} from "./ViewerContainer";
import {PreferencesManager} from "../../util/preferencesManager";
import {fullRowStyle} from "../../util/styles";
import {QueryStatus} from "../query/QueryHeader";
import {examples} from "../../examples";
import {Button, Message, Modal} from "semantic-ui-react";
import {rootViewModel} from "../../store/viewModel/systemViewModel";
import {DrawerState} from "../../store/viewModel/layout/DockableDrawerViewModel";
import {CompartmentsPanel} from "./compartments/CompartmentsPanel";
import {useLayout} from "../../hooks/useLayout";

const neuronViewModelMap = new Map<string, NeuronViewModel>();

const tracingNeuronMap = new Map<string, string>();

const tracingViewModelMap2 = new Map<string, TracingViewModel>();

export enum FetchState {
    Running = 1,
    Paused
}

interface FetchCalc {
    knownTracings: TracingViewModel[];
    hadQuery: boolean;
}

interface NeuronCalc {
    neurons: NeuronViewModel[];
    fetchCalc: FetchCalc;
}

interface IOutputContainerProps {
    isQueryCollapsed: boolean;
    queryStatus: QueryStatus;
    isLoading: boolean;
    neurons: INeuron[];
    constants: NdbConstants;
    nonce: string;
    shouldAlwaysShowFullTracing: boolean;
    shouldAlwaysShowSoma: boolean;
    isPublicRelease: boolean;
    exportLimit: number;

    requestExport?(tracingIds: string[], format: ExportFormat): any;
    populateCustomPredicate?(position: IPositionInput, replace: boolean): void;
    onToggleQueryCollapsed(): void;
}

interface IOutputContainerState {
    defaultStructureSelection?: NeuronViewMode;
    latestTiming?: ITiming;
    fetchState?: FetchState;
    fetchCount?: number;
    isRendering?: boolean;
    isExportMessageOpen?: boolean;
}

// TODO Direct references to rootViewModel without observing may not update.

export class MainView extends React.Component<IOutputContainerProps, IOutputContainerState> {
    private _queuedIds: string[] = [];
    private _isInQuery: boolean = false;
    private _colorIndex: number = 0;
    private _fetchBatchSize = PreferencesManager.Instance.TracingFetchBatchSize;

    private _expectingFetch = false;

    public constructor(props: IOutputContainerProps) {
        super(props);

        this.updateNeuronViewModels(props, false);

        this.state = {
            defaultStructureSelection: NEURON_VIEW_MODE_SOMA,
            fetchState: FetchState.Running,
            fetchCount: 0,
            isRendering: false,
            latestTiming: null,
            isExportMessageOpen: false
        };
    }

    private onSetFetchState(fetchState: FetchState) {
        this.setState({fetchState}, () => this.fetchTracings());
    }

    public onCancelFetch() {
        this._queuedIds = [];

        /*const neuronViewModels = */
        rootViewModel.Viewer.neuronViewModels.map(n => {
            n.cancelRequestedViewMode();
            return n;
        });

        this.updateNeuronViewModels(this.props, true);

        this.setState({fetchState: FetchState.Running, fetchCount: 0/*, neuronViewModels: neuronViewModels.slice()*/});
    }

    private completeFetch() {
        this._expectingFetch = false;
    }

    public resetPage() {
        this._colorIndex = 0;
        // Must do before cancelFetch which will update state for this property.
        Array.from(neuronViewModelMap.values()).map(n => {
            n.isSelected = n.isSelected || this.props.shouldAlwaysShowSoma
        });
        this.onCancelFetch();
        // this.ViewerContainer.TracingViewer.reset();
        // this.setState({displayHighlightedOnly: false, highlightSelectionMode: HighlightSelectionMode.Normal});
    }

    private static neuronIdsForExport(): string[] {
        const neurons = rootViewModel.Viewer.neuronViewModels.filter(v => v.isSelected);

        return neurons.map(n => n.neuron.idString);
    }

    private async onExportSelectedTracings(format: ExportFormat) {
        try {
            const ids = MainView.neuronIdsForExport();

            if (ids.length === 0) {
                return;
            }

            const location = format === ExportFormat.JSON ? "/json" : "/swc";

            fetch(location, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ids
                })
            }).then(async (response) => {
                if (response.status !== 200) {
                    this.setState({isExportMessageOpen: true});
                    return;
                }
                const data: any = await response.json();

                let contents = data.contents;

                let mime = "text/plain;charset=utf-8";

                if (format === ExportFormat.SWC) {
                    contents = dataToBlob(contents);

                    if (ids.length > 1) {
                        mime = "application/zip";
                    }
                } else {
                    contents = JSON.stringify(contents, null, 2);
                }


                saveFile(contents, `${data.filename}`, mime);
            }).catch((err) => {
                console.log(err)
            });
        } catch (error) {
            console.log(error);
        }
    }

    /*
    private onToggleDisplayHighlighted() {
        this.setState({displayHighlightedOnly: !this.state.displayHighlightedOnly});
    }

    private onChangeHighlightMode() {
        let nextHighlightMode = this.state.highlightSelectionMode === HighlightSelectionMode.Normal ? HighlightSelectionMode.Cycle : HighlightSelectionMode.Normal;

        let displayHighlightedOnly = this.state.displayHighlightedOnly;

        let cycleFocusNeuronId = null;

        if (nextHighlightMode === HighlightSelectionMode.Cycle) {
            const active = this.state.neuronViewModels.find(n => n.isInHighlightList);

            if (active) {
                cycleFocusNeuronId = active.neuron.id;
            }

            displayHighlightedOnly = true;
        } else {
            displayHighlightedOnly = this.state.wasDisplayHighlightedOnly;
            cycleFocusNeuronId = null;
        }

        this.setState({
            displayHighlightedOnly,
            highlightSelectionMode: nextHighlightMode,
            wasDisplayHighlightedOnly: this.state.displayHighlightedOnly,
            cycleFocusNeuronId
        });
    }
    */

    /*
    private onChangeHighlightTracing(neuronViewModel: NeuronViewModel, shouldHighlight: boolean = null) {
        neuronViewModel.isInHighlightList = shouldHighlight == null ? !neuronViewModel.isInHighlightList : shouldHighlight;

        // TODO Highlighting working?
        // const tracingsToDisplay = this.state.tracingsToDisplay.slice();

        // this.setState({tracingsToDisplay});

        this.verifyHighlighting();
    }
    */

    private onChangeSelectTracing(id: string, shouldSelect: boolean) {
        // const neuronViewModels = this.state.neuronViewModels.slice();

        neuronViewModelMap.get(id).isSelected = shouldSelect;

        const fetchCalc = this.determineTracingFetchState(rootViewModel.Viewer.neuronViewModels);

        rootViewModel.Viewer.Tracings.replace(fetchCalc.knownTracings);

        // this.setState({neuronViewModels/*, tracingsToDisplay: fetchCalc.knownTracings*/});
    }

    private onChangeSelectAllTracings(shouldSelectAll: boolean) {
        // const neuronViewModels = this.state.neuronViewModels.slice();

        neuronViewModelMap.forEach(v => v.isSelected = shouldSelectAll);

        const fetchCalc = this.determineTracingFetchState(rootViewModel.Viewer.neuronViewModels);

        rootViewModel.Viewer.Tracings.replace(fetchCalc.knownTracings);

        // this.setState({neuronViewModels/*, tracingsToDisplay: fetchCalc.knownTracings*/});
    }

    private onChangeNeuronColor(neuron: NeuronViewModel, color: any) {
        // const neuronViewModels = this.state.neuronViewModels.slice();

        neuron.baseColor = color.hex;

        // this.setState({neuronViewModels});
    }

    private onChangeNeuronMirror(neuron: NeuronViewModel, mirror: boolean) {
        // const neuronViewModels = this.state.neuronViewModels.slice();

        neuron.mirror = mirror;

        // this.setState({neuronViewModels});
    }

    private onChangeDefaultStructure(mode: NeuronViewMode) {
        this.setState({defaultStructureSelection: mode});

        rootViewModel.Viewer.neuronViewModels.map(v => v.requestViewMode(mode.structure));

        const fetchCalc = this.determineTracingFetchState(rootViewModel.Viewer.neuronViewModels.slice());

        rootViewModel.Viewer.Tracings.replace(fetchCalc.knownTracings);

        // this.setState({tracingsToDisplay: fetchCalc.knownTracings});
    }


    private onChangeIsRendering(isRendering: boolean) {
        if (isRendering !== this.state.isRendering) {
            this.setState({isRendering});
        }
    }

    private onChangeNeuronViewMode(neuronViewModel: NeuronViewModel, viewMode: NeuronViewMode) {
        neuronViewModel.requestViewMode(viewMode.structure);

        if (viewMode.structure !== TracingStructure.soma) {
            neuronViewModel.toggleViewMode = viewMode;
        }

        this.updateNeuronViewModels(this.props, true);

        rootViewModel.Viewer.verifyHighlighting();
    }

    private onToggleSomaViewMode(neuronViewModel: NeuronViewModel) {
        if (neuronViewModel.ViewMode.structure !== TracingStructure.soma) {
            neuronViewModel.toggleViewMode = neuronViewModel.ViewMode;
            neuronViewModel.requestViewMode(TracingStructure.soma);
        } else {
            neuronViewModel.requestViewMode(neuronViewModel.toggleViewMode.structure);
        }

        this.updateNeuronViewModels(this.props, true);

        rootViewModel.Viewer.verifyHighlighting();
    }

    private onToggleTracing(id: string) {
        const tracing = tracingViewModelMap2.get(id);

        this.onToggleSomaViewMode(tracing.neuron);
    }

    /*
        private onSetHighlightedNeuron(neuron: NeuronViewModel) {
            this.setState({cycleFocusNeuronId: neuron.Id});
        }

        private onCycleHighlightNeuron(direction: number) {
            const highlighted = this.state.neuronViewModels.filter(n => n.isInHighlightList).map(n => n.neuron.id);

            if (highlighted.length < 2) {
                return;
            }

            if (this.state.cycleFocusNeuronId === null) {
                if (highlighted.length > 0) {
                    this.setState({cycleFocusNeuronId: highlighted[0]});
                }
            } else {
                const index = highlighted.indexOf(this.state.cycleFocusNeuronId);

                if (direction < 0) {
                    if (index > 0) {
                        this.setState({cycleFocusNeuronId: highlighted[index - 1]});
                    } else {
                        this.setState({cycleFocusNeuronId: highlighted[length - 1]});
                    }
                } else {
                    if (index < highlighted.length - 1) {
                        this.setState({cycleFocusNeuronId: highlighted[index + 1]});
                    } else {
                        this.setState({cycleFocusNeuronId: highlighted[0]});
                    }
                }
            }
        }

        private verifyHighlighting() {
            if (this.state.highlightSelectionMode === HighlightSelectionMode.Cycle) {
                const highlighted = this.state.neuronViewModels.filter(n => n.isInHighlightList).map(n => n.neuron.id);

                if (this.state.cycleFocusNeuronId === null || !highlighted.some(id => id === this.state.cycleFocusNeuronId)) {
                    if (highlighted.length > 0) {
                        this.setState({cycleFocusNeuronId: highlighted[0]});
                    } else {
                        this.setState({highlightSelectionMode: HighlightSelectionMode.Normal});
                    }
                }
            }
        }
    */
    public componentWillReceiveProps(props: IOutputContainerProps) {
        if (props.queryStatus === QueryStatus.Loading) {
            this._colorIndex = 0;
            this._expectingFetch = true;

            this.onCancelFetch();

            return;
        }

        const neuronCalc = this.updateNeuronViewModels(props, true, examples.find(e => e.filters[0].id === props.nonce));

        rootViewModel.Viewer.verifyHighlighting();

        if (this._expectingFetch && !neuronCalc.fetchCalc.hadQuery) {
            this.completeFetch();
        }
    }

    private updateNeuronViewModels(props: IOutputContainerProps, setState: boolean, example: any = null): NeuronCalc {
        let loadedModels: NeuronViewModel[] = [];

        props.neurons.map((neuron, index) => {
            let viewModel = neuronViewModelMap.get(neuron.id);

            if (!viewModel) {
                const color = jet[this._colorIndex++ % jet.length];

                viewModel = new NeuronViewModel(neuron, color);

                neuronViewModelMap.set(neuron.id, viewModel);

                neuron.tracings.map(t => {
                    tracingNeuronMap.set(t.id, neuron.id);

                    const model = new TracingViewModel(t.id, viewModel);

                    model.soma = t.soma;
                    model.structure = t.tracingStructure;

                    tracingViewModelMap2.set(t.id, model);

                    viewModel.tracings.push(model);

                    if (t.tracingStructure.value === TracingStructure.axon) {
                        viewModel.hasAxonTracing = true;
                    }

                    if (t.tracingStructure.value === TracingStructure.dendrite) {
                        viewModel.hasDendriteTracing = true;
                    }
                });

                if (neuron.tracings.length > 0) {
                    const somaTracingModel = new TracingViewModel(neuron.id, viewModel);

                    // Borrow soma data from one of the tracings.
                    somaTracingModel.soma = viewModel.neuron.tracings[0].soma;

                    somaTracingModel.structure = TracingStructures.Soma;

                    viewModel.somaOnlyTracing = somaTracingModel;

                    // Store under the neuron id.
                    tracingViewModelMap2.set(neuron.id, somaTracingModel);
                }

                if (this.props.shouldAlwaysShowFullTracing) {
                    viewModel.requestViewMode(TracingStructure.all);
                    viewModel.isSelected = true;
                } else if (this.props.shouldAlwaysShowSoma) {
                    viewModel.requestViewMode(TracingStructure.soma);
                    viewModel.isSelected = true;
                } else {
                    viewModel.requestViewMode(this.state.defaultStructureSelection.structure);
                    viewModel.isSelected = false;
                }
            }

            if (example) {
                viewModel.requestViewMode(TracingStructure.all);

                if (index < example.colors.length) {
                    viewModel.baseColor = example.colors[index];
                }
            }

            loadedModels.push(viewModel);
        });

        const fetchCalc = this.determineTracingFetchState(loadedModels);

        if (setState) {
            rootViewModel.Viewer.Tracings.replace(fetchCalc.knownTracings);
            rootViewModel.Viewer.neuronViewModels.replace(loadedModels);
            // this.setState({neuronViewModels: loadedModels/*, tracingsToDisplay: fetchCalc.knownTracings*/});
        }

        return {
            neurons: loadedModels,
            fetchCalc
        };
    }

    private determineTracingFetchState(knownViewModels: NeuronViewModel[]): FetchCalc {
        let tracingsToDisplay: TracingViewModel[] = null;

        let hadQuery = false;

        const neuronsToDisplay = knownViewModels.filter(v => v.isSelected);

        if (neuronsToDisplay.length > 0) {
            const ids = neuronsToDisplay.reduce((prev, n) => {
                const viewMode = n.ViewMode.structure;

                prev.full = prev.full.concat(n.neuron.tracings.filter(t => {
                    switch (viewMode) {
                        case TracingStructure.all:
                            return true;
                        case TracingStructure.axon:
                            return t.tracingStructure.value == TracingStructure.axon;
                        case TracingStructure.dendrite:
                            return t.tracingStructure.value == TracingStructure.dendrite;
                        default:
                            return false; // soma handled separately - no fetch required.
                    }
                }).map(t => t.id));

                if (viewMode === TracingStructure.soma) {
                    if (n.somaOnlyTracing) {
                        prev.soma.push(n.neuron.id);
                        n.requestViewMode(TracingStructure.soma);
                    }
                }

                return prev;
            }, {full: [], soma: []});

            const availableFullIds = Array.from(tracingViewModelMap2.values()).filter(t => t.tracing !== null).map(t => t.id);

            const known = _.intersection(ids.full, availableFullIds);

            const toQuery = _.difference(ids.full, known);

            tracingsToDisplay = known.map(id => {
                const neuronModel = neuronViewModelMap.get(tracingNeuronMap.get(id));

                if (neuronModel) {
                    neuronModel.completedViewModeRequest();
                }

                return tracingViewModelMap2.get(id);
            });

            tracingsToDisplay = tracingsToDisplay.concat(ids.soma.map(id => tracingViewModelMap2.get(id)));

            if (toQuery.length > 0) {
                hadQuery = true;
                this.queueTracings(toQuery);
            }
        } else {
            tracingsToDisplay = [];
        }

        return {
            knownTracings: tracingsToDisplay,
            hadQuery
        };
    }

    private queueTracings(ids: string[]) {
        this._queuedIds = _.uniq(this._queuedIds.concat(ids));

        this.fetchTracings();
    }

    private fetchTracings() {
        if (this._isInQuery || this._queuedIds.length === 0 || this.state.fetchState !== FetchState.Running) {
            return;
        }

        const ids = this._queuedIds.splice(0, this._fetchBatchSize);

        this._isInQuery = true;

        this.setState({fetchCount: this._queuedIds.length, latestTiming: null});

        let timing: ITiming = null;

        fetch('/tracings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ids
            })
        }).then(async (data) => {
            if (data.status === 200) {
                const arrive = Date.now();

                const tracingsData = await data.json();

                const tracings = tracingsData.tracings;

                let tracingsToDisplay = rootViewModel.Viewer.Tracings; // this.state.tracingsToDisplay;

                tracings.forEach((t: ITracing) => {
                    const model = tracingViewModelMap2.get(t.id);
                    model.tracing = t;
                    tracingsToDisplay.push(model);

                    const neuronModel = neuronViewModelMap.get(tracingNeuronMap.get(t.id));

                    if (neuronModel) {
                        neuronModel.completedViewModeRequest();
                    }
                });

                timing = Object.assign({}, tracingsData.timing, {transfer: (arrive.valueOf() - tracingsData.timing.sent) / 1000});

                rootViewModel.Viewer.Tracings.replace(tracingsToDisplay);
                this.setState({fetchCount: this._queuedIds.length/*, tracingsToDisplay*/, latestTiming: timing});

                this._isInQuery = false;
            } else {
                console.log(data);

                ids.forEach(id => {
                    const v = neuronViewModelMap.get(tracingNeuronMap.get(id));
                    v.isSelected = false;
                    v.cancelRequestedViewMode();
                });

                this.setState({
                    // neuronViewModels: this.state.neuronViewModels.slice(),
                    fetchCount: this._queuedIds.length,
                    latestTiming: null
                });

                this._isInQuery = false;
            }

            if (this._queuedIds.length === 0) {
                this.completeFetch();
            }

            setTimeout(() => this.fetchTracings(), 0);
        }).catch((err) => {
            ids.forEach(id => {
                const v = neuronViewModelMap.get(tracingNeuronMap.get(id));
                v.cancelRequestedViewMode();
                v.isSelected = false;
            });

            this.setState({
                // neuronViewModels: this.state.neuronViewModels.slice(),
                fetchCount: this._queuedIds.length,
                latestTiming: null
            });

            console.log(err);

            this._isInQuery = false;

            setTimeout(() => this.fetchTracings(), 0);
        });
    }

    public render() {
        const isAllTracingsSelected = !rootViewModel.Viewer.neuronViewModels.some(v => !v.isSelected);

        const tableProps = {
            queryStatus: this.props.queryStatus,
            isAllTracingsSelected,
            defaultStructureSelection: this.state.defaultStructureSelection,
            isPublicRelease: this.props.isPublicRelease,
            exportLimit: this.props.exportLimit,
            onRequestExport: (f) => this.onExportSelectedTracings(f),
            onChangeSelectTracing: (id: string, b: boolean) => this.onChangeSelectTracing(id, b),
            onChangeNeuronColor: (n: NeuronViewModel, c: any) => this.onChangeNeuronColor(n, c),
            onChangeNeuronMirror: (n: NeuronViewModel, b: boolean) => this.onChangeNeuronMirror(n, b),
            onChangeNeuronViewMode: (n: NeuronViewModel, v: NeuronViewMode) => this.onChangeNeuronViewMode(n, v),
            onChangeSelectAllTracings: (b: boolean) => this.onChangeSelectAllTracings(b),
            onChangeDefaultStructure: (mode: NeuronViewMode) => this.onChangeDefaultStructure(mode)
        };

        const viewerProps = {
            constants: this.props.constants,
            isLoading: this.props.isLoading,
            highlightedTracings: [],
            isRendering: this.state.isRendering,
            fetchCount: this.state.fetchCount,
            fixedAspectRatio: null,
            isQueryCollapsed: this.props.isQueryCollapsed,
            fetchState: this.state.fetchState,
            onSetFetchState: (s) => this.onSetFetchState(s),
            onCancelFetch: () => this.onCancelFetch(),
            onChangeNeuronViewMode: (n: NeuronViewModel, v: NeuronViewMode) => this.onChangeNeuronViewMode(n, v),
            onToggleQueryCollapsed: this.props.onToggleQueryCollapsed,
            onChangeIsRendering: (b: boolean) => this.onChangeIsRendering(b),
            onToggleTracing: (id: string) => this.onToggleTracing(id),
            populateCustomPredicate: (p: IPositionInput, b: boolean) => this.props.populateCustomPredicate(p, b)
        };

        const is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        // Navbar @ 79, fixed query header @ 40, and if expanded, query area at 300 => 119 or 419
        let offset = this.props.isQueryCollapsed ? 119 : 419;

        if (is_chrome) {
            offset -= 0;
        }
        const baseStyle = {
            position: "fixed" as "fixed",
            zIndex: 2,
            top: offset + "px",
            height: "calc(100% - " + offset + "px)",
            backgroundColor: "#ffffffdd"
        };

        const style = {width: "100%", height: "100%"};

        return (
            <div id="mainView" style={style}>
                <Modal open={this.state.isExportMessageOpen} dimmer="blurring"
                       onClose={() => this.setState({isExportMessageOpen: false})}>
                    <Modal.Header content="Export Failed"/>
                    <Modal.Content>
                        <Message error
                                 content="There was an issue contacting the download server. The tracings were not downloaded."/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button content="Ok" onClick={() => this.setState({isExportMessageOpen: false})}/>
                    </Modal.Actions>
                </Modal>
                <FloatingNeuronsPanel neuronProps={tableProps} baseStyle={baseStyle}/>
                <FloatingCompartmentPanel baseStyle={baseStyle}/>
                <Overlay offset={offset}/>
                <MainPanel viewerProps={viewerProps} neuronProps={tableProps}/>
            </div>
        );
    }
}

type OverlayProps = {
    offset: number;
}

/**
 * If either the neurons or compartments panel is floating, add an invisible div over the viewer header to capture
 * mouse clicks and close those floating windows.
 */
const Overlay = observer((props: OverlayProps) => {
    const {CompartmentsDrawer, NeuronsDrawer} = useLayout();

    if (CompartmentsDrawer.DrawerState !== DrawerState.Float && NeuronsDrawer.DrawerState !== DrawerState.Float) {
        return null;
    }

    return (
        <div id="overlay" style={{
            width: "100%",
            position: "fixed",
            top: props.offset + "px",
            zIndex: 1,
            height: "calc(100% - " + props.offset + "px)",
            backgroundColor: "#000000",
            opacity: 0.1
        }} onClick={() => {
            if (CompartmentsDrawer.DrawerState === DrawerState.Float) {
                CompartmentsDrawer.DrawerState = DrawerState.Hidden
            }
            if (NeuronsDrawer.DrawerState === DrawerState.Float) {
                NeuronsDrawer.DrawerState = DrawerState.Hidden
            }
        }}/>
    );
});

type FloatingCompartmentPanelProps = {
    baseStyle: any;
}

const FloatingCompartmentPanel = observer((props: FloatingCompartmentPanelProps) => {
    const {CompartmentsDrawer} = useLayout();

    if (CompartmentsDrawer.DrawerState !== DrawerState.Float) {
        return null;
    }

    return (
        <div id="floatingCompartments" style={Object.assign({left: "calc(100% - 400px)"}, props.baseStyle)}>
            <CompartmentsPanel/>
        </div>
    );
});

type FloatingNeuronsPanelProps = {
    baseStyle: any;
    neuronProps: INeuronListContainerProps;
}

const FloatingNeuronsPanel = observer((props: FloatingNeuronsPanelProps) => {
    const {NeuronsDrawer} = useLayout();

    if (NeuronsDrawer.DrawerState !== DrawerState.Float) {
        return null;
    }

    return (
        <div id="floatingNeurons" style={props.baseStyle}>
            <NeuronListContainer {...props.neuronProps}/>
        </div>
    );
});

type MainPanelProps = {
    viewerProps: IViewerProps;
    neuronProps: INeuronListContainerProps;
}

const MainPanel = observer((props: MainPanelProps) => {
    const {CompartmentsDrawer, NeuronsDrawer} = useLayout();

    return (
        <div id="mainPanel" style={fullRowStyle}>
            {NeuronsDrawer.DrawerState === DrawerState.Dock ? <NeuronListContainer {...props.neuronProps}/> : null}
            <ViewerContainer {...props.viewerProps}/>
            {CompartmentsDrawer.DrawerState === DrawerState.Dock ? <CompartmentsPanel/> : null}
        </div>
    )
});

function saveFile(data: any, filename: string, mime: string = null) {
    const blob = new Blob([data], {type: mime || "text/plain;charset=utf-8"});

    if (typeof window.navigator.msSaveBlob !== "undefined") {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const blobURL = window.URL.createObjectURL(blob);
        const tempLink = document.createElement("a");
        tempLink.href = blobURL;
        tempLink.setAttribute("download", filename);
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    }
}

function dataToBlob(encoded) {
    const byteString = atob(encoded);

    const ab = new ArrayBuffer(byteString.length);

    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return ab;
}
