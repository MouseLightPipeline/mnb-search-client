import {Object3D, Scene} from "three";
import {difference} from "lodash"

import {SharkViewer} from "../shark_viewer";
import {Point3D} from "../../util/viewerTypes";
import {TomographyConstants} from "../../tomography/tomographyConstants";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {ITracingNode} from "../../models/tracingNode";
import {ITracingGeometry} from "./tracingGeometry";
import {TracingStructure} from "../../models/tracingStructure";
import {rootViewModel} from "../../store/viewModel/systemViewModel";
import {PreferencesManager} from "../../util/preferencesManager";
import {HighlightSelectionMode} from "../../components/output/TracingViewer";

export type TracingId = string;

export class TracingManager {
    private readonly _scene: Scene;
    private readonly _geometry: ITracingGeometry;

    private _centerPoint: Point3D = [TomographyConstants.Instance.Sagittal.Center, TomographyConstants.Instance.Horizontal.Center, TomographyConstants.Instance.Coronal.Center];

    private _tracings = new Map<TracingId, Object3D>();

    public constructor(viewer: SharkViewer) {
        this._scene = viewer.Scene;
        this._geometry = viewer.Geometry;
    }

    public get Scene(): Scene {
        return this._scene;
    }

    public renderTracings(tracings: TracingViewModel[]) {
        if (tracings.length === 0) {
            this.hideAll();
            return;
        }

        const highlightValue = PreferencesManager.Instance.TracingSelectionHiddenOpacity;

        tracings.forEach(c => {
            if (!this._tracings.has(c.id)) {
                this.createNeuron(c, highlightValue)
            } else {
                this.verifyNeuron(c, highlightValue);
            }
        });

        const requestedIds = tracings.map(c => c.id);

        const knownCompartments = Array.from(this._tracings.keys());
        const visibleCompartments = knownCompartments.filter(id => this._tracings.get(id)?.visible || false);

        const toHide = difference(visibleCompartments, requestedIds);
        toHide.forEach(id => this.setVisibleForId(id, false));

    }

    private static setVisible(tracing: Object3D, visible: boolean) {
        // May be in the process of loading.
        if (tracing != null) {
            tracing.visible = visible;
        }
    }

    private setVisibleForId(id: string, visible: boolean) {
        TracingManager.setVisible(this._tracings.get(id), visible);
    }

    private hideAll() {
        this._tracings.forEach(c => TracingManager.setVisible(c, false));
    }

    private createNeuron(tracing: TracingViewModel, fadedOpacity: number) {
        /*
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

        let color = Color(tracing.neuron.baseColor);

        if (tracing.structure.value === TracingStructure.dendrite) {
            color = color.darken(0.75);
        }

        rootViewModel.Viewer.viewer.loadNeuron(tracing.id, color.hex(), nodes);

        this.setOpacity(tracing, fadedOpacity);

        this._knownNeurons.add(tracing.id);
        */
    }

    private verifyNeuron(tracing: TracingViewModel, fadedOpacity: number) {

    }
/*
    private setOpacity(tracing: TracingViewModel, fadedOpacity: number) {
        if (this.props.highlightSelectionMode === HighlightSelectionMode.Normal) {
            rootViewModel.Viewer.viewer.setNeuronDisplayLevel(tracing.id, !this.props.displayHighlightedOnly || tracing.IsHighlighted ? 1.0 : fadedOpacity);
        } else {
            if (tracing.NeuronId === this.props.cycleFocusNeuronId) {
                rootViewModel.Viewer.viewer.setNeuronDisplayLevel(tracing.id, 1.0);
            } else {
                rootViewModel.Viewer.viewer.setNeuronDisplayLevel(tracing.id, tracing.IsHighlighted ? 0.1 : fadedOpacity);
            }
        }
    }*/

    private createNeuronGeometry(id: TracingId, color: string, nodes: ITracingNode[]) {
        const particleScale = (0.5 * this._geometry.AspectRatio) / Math.tan(0.5 * this._geometry.FieldOfView * Math.PI / 180.0);

        const neuron = this._geometry.createNeuron(nodes, particleScale, color);

        neuron.name = id;

        this._scene.add(neuron);

        neuron.position.set(-this._centerPoint[0], -this._centerPoint[1], -this._centerPoint[2]);

        this._tracings.set(id, neuron);
    };
}