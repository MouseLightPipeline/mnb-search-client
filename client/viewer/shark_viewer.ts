import {
    Scene,
    Raycaster,
    Object3D,
    Color,
    Vector2,
    Vector3,
    Points,
    Mesh,
    Texture,
    BufferGeometry,
    DirectionalLight,
    PerspectiveCamera,
    WebGLRenderer,
    Float32BufferAttribute,
    Uint32BufferAttribute,
    ShaderMaterial,
    OBJLoader, DoubleSide, Shader, ShaderMaterialParameters
} from "three";

const THREE = require("three");
require("three-obj-loader")(THREE);
const OrbitControls = require("ndb-three-orbit-controls")(THREE);

import {NODE_PARTICLE_IMAGE} from "./util";
import {PreferencesManager} from "../util/preferencesManager";

import {SystemShader} from "./shaders/shaders";
import {StandardShader} from "./shaders/standardShader";

const DEFAULT_POINT_THRESHOLD = 50;

type CompilableShader = (shader: Shader) => void;

// onBeforeCompile not currently in type definitions.
export class CompiledShaderMaterial extends ShaderMaterial {
    public constructor(parameters?: ShaderMaterialParameters) {
        super(parameters);
    }

    public onBeforeCompile: CompilableShader;
}

export type SelectNodeHandler = (tracingId: string, sampleNumber: number, event) => void;
export type ToggleNodeHandler = (tracingId: string, sampleNumber: number) => void;

export class SharkViewer {
    public ElementName = "viewer-container";

    public CenterPoint = null;

    public Shader: SystemShader = new StandardShader();

    public OnSelectNode: SelectNodeHandler = null;
    public OnToggleNode: ToggleNodeHandler = null;

    private fov: number = 45;
    private last_anim_timestamp = null;
    private mouseHandler = null;
    private nodeParticleTexture = NODE_PARTICLE_IMAGE;
    private raycaster: Raycaster = new Raycaster();
    private renderer: WebGLRenderer = null;
    private scene: Scene = null;
    private camera: PerspectiveCamera = null;
    private trackControls = null;

    public get Scene(): Scene {
        return this.scene;
    }

    private static generateParticle(node) {
        return new Vector3(node.x, node.y, node.z);
    }

    private static generateCone(node, node_parent, node_color: Color) {
        const cone_child: any = {};
        const cone_parent: any = {};

        cone_child.vertex = new Vector3(node.x, node.y, node.z);
        cone_child.radius = node.radius;
        cone_child.color = node_color;

        cone_parent.vertex = new Vector3(node_parent.x, node_parent.y, node_parent.z);
        cone_parent.radius = node_parent.radius;
        cone_parent.color = node_color;

        // normals
        const n1 = new Vector3().subVectors(cone_parent.vertex, cone_child.vertex);
        const n2 = n1.clone().negate();

        return {
            'child': cone_child,
            'parent': cone_parent,
            'normal1': n1,
            'normal2': n2
        };
    }

    private createNeuron(swc_json, color: string) {
        //neuron is object 3d which ensures all components move together
        const neuron = new Object3D();
        let geometry, material;

        // special imposter image contains:
        // 1 - colorizable sphere image in red channel
        // 2 - specular highlight in green channel
        // 3 - depth offset in blue channel (currently unused)
        const image = document.createElement('img');
        const sphereImg = new Texture(image);
        image.onload = function () {
            sphereImg.needsUpdate = true;
        };
        image.src = this.nodeParticleTexture;

        geometry = new BufferGeometry();
        // properties that may vary from particle to particle. only accessible in vertex shaders!
        //	(can pass color info to fragment shader via vColor.)
        // compute scale for particles, in pixels
        const particleScale = (0.5 * this.renderer.getSize().height / this.renderer.getPixelRatio()) / Math.tan(0.5 * this.fov * Math.PI / 180.0);

        const customAttributes =
            {
                radius: {type: "fv1", value: []},
                typeColor: {type: "c", value: []},
                vertices: {type: "f", value: []},
            };

        const customUniforms =
            {
                particleScale: {type: 'f', value: particleScale},
                sphereTexture: {type: 't', value: sphereImg},
            };

        const indexLookup = {};

        const node_color = new Color(color);

        for (const node in swc_json) {
            if (swc_json.hasOwnProperty(node)) {

                let particle_vertex = SharkViewer.generateParticle(swc_json[node]);

                let radius = swc_json[node].radius;

                customAttributes.radius.value.push(radius);
                customAttributes.typeColor.value.push(node_color.r);
                customAttributes.typeColor.value.push(node_color.g);
                customAttributes.typeColor.value.push(node_color.b);
                customAttributes.vertices.value.push(particle_vertex.x);
                customAttributes.vertices.value.push(particle_vertex.y);
                customAttributes.vertices.value.push(particle_vertex.z);

                indexLookup[customAttributes.radius.value.length - 1] = swc_json[node].sampleNumber;
            }
        }
        geometry.addAttribute('position', new Float32BufferAttribute(customAttributes.vertices.value, 3));
        geometry.addAttribute('radius', new Float32BufferAttribute(customAttributes.radius.value, 1));
        geometry.addAttribute('typeColor', new Float32BufferAttribute(customAttributes.typeColor.value, 3));

        material = new ShaderMaterial(
            {
                uniforms: customUniforms,
                vertexShader: this.Shader.NodeShader.VertexShader,
                fragmentShader: this.Shader.NodeShader.FragmentShader,
                transparent: true,
                alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
            });
        material.extensions.fragDepth = true;


        let materialShader = null;

        const particles = new Points(geometry, material);
        particles.userData = {indexLookup, materialShader};

        material.onBeforeCompile = function (shader) {
            shader.uniforms.alpha = {value: 0};
            shader.vertexShader = 'uniform float alpha;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    'vAlpha = alpha'
                ].join('\n')
            );
            materialShader = shader;

            materialShader.uniforms.alpha.value = 0.9;

            particles.userData.materialShader = materialShader;
        };

        neuron.add(particles);

        // Cone quad impostors, to link spheres together
        const coneAttributes =
            {
                radius: {type: "fv1", value: []},
                indices: {type: "iv1", value: []},
                typeColor: {type: "c", value: []},
                vertices: {type: "f", value: []},
                normals: {type: "f", value: []},
                uv: {type: "f", value: []}
            };
        const coneUniforms =
            {
                sphereTexture: {type: 't', value: sphereImg},
            };
        const uvs = [
            new Vector2(0.5, 0),
            new Vector2(0.5, 1),
            new Vector2(0.5, 1)
        ];
        const coneGeom = new BufferGeometry();
        let ix21 = 0;
        for (const node in swc_json) {
            if (swc_json.hasOwnProperty(node)) {
                if (swc_json[node].parent !== -1) {

                    // Paint two triangles to make a cone-impostor quadrilateral
                    // Triangle #1
                    const cone = SharkViewer.generateCone(swc_json[node], swc_json[swc_json[node].parent], node_color);

                    let child_radius = cone.child.radius;

                    // vertex 1
                    coneAttributes.vertices.value.push(cone.child.vertex.x);
                    coneAttributes.vertices.value.push(cone.child.vertex.y);
                    coneAttributes.vertices.value.push(cone.child.vertex.z);
                    coneAttributes.radius.value.push(child_radius);
                    coneAttributes.typeColor.value.push(node_color.r);
                    coneAttributes.typeColor.value.push(node_color.g);
                    coneAttributes.typeColor.value.push(node_color.b);
                    coneAttributes.normals.value.push(cone.normal1.x);
                    coneAttributes.normals.value.push(cone.normal1.y);
                    coneAttributes.normals.value.push(cone.normal1.z);
                    coneAttributes.uv.value.push(uvs[0].x);
                    coneAttributes.uv.value.push(uvs[0].y);
                    coneAttributes.indices.value.push(ix21);
                    ix21++;

                    // vertex 2
                    coneAttributes.vertices.value.push(cone.child.vertex.x);
                    coneAttributes.vertices.value.push(cone.child.vertex.y);
                    coneAttributes.vertices.value.push(cone.child.vertex.z);
                    coneAttributes.radius.value.push(child_radius);
                    coneAttributes.typeColor.value.push(node_color.r);
                    coneAttributes.typeColor.value.push(node_color.g);
                    coneAttributes.typeColor.value.push(node_color.b);
                    coneAttributes.normals.value.push(cone.normal2.x);
                    coneAttributes.normals.value.push(cone.normal2.y);
                    coneAttributes.normals.value.push(cone.normal2.z);
                    coneAttributes.uv.value.push(uvs[1].x);
                    coneAttributes.uv.value.push(uvs[1].y);
                    coneAttributes.indices.value.push(ix21);
                    ix21++;

                    // vertex 3
                    coneAttributes.vertices.value.push(cone.parent.vertex.x);
                    coneAttributes.vertices.value.push(cone.parent.vertex.y);
                    coneAttributes.vertices.value.push(cone.parent.vertex.z);
                    coneAttributes.radius.value.push(child_radius);
                    coneAttributes.typeColor.value.push(node_color.r);
                    coneAttributes.typeColor.value.push(node_color.g);
                    coneAttributes.typeColor.value.push(node_color.b);
                    coneAttributes.normals.value.push(cone.normal2.x);
                    coneAttributes.normals.value.push(cone.normal2.y);
                    coneAttributes.normals.value.push(cone.normal2.z);
                    coneAttributes.uv.value.push(uvs[2].x);
                    coneAttributes.uv.value.push(uvs[2].y);
                    coneAttributes.indices.value.push(ix21);
                    ix21++;

                    // Triangle #2
                    // Parent

                    let parent_radius = cone.parent.radius;

                    // vertex 1
                    coneAttributes.vertices.value.push(cone.parent.vertex.x);
                    coneAttributes.vertices.value.push(cone.parent.vertex.y);
                    coneAttributes.vertices.value.push(cone.parent.vertex.z);
                    coneAttributes.radius.value.push(parent_radius);
                    coneAttributes.typeColor.value.push(node_color.r);
                    coneAttributes.typeColor.value.push(node_color.g);
                    coneAttributes.typeColor.value.push(node_color.b);
                    coneAttributes.normals.value.push(cone.normal1.x);
                    coneAttributes.normals.value.push(cone.normal1.y);
                    coneAttributes.normals.value.push(cone.normal1.z);
                    coneAttributes.uv.value.push(uvs[0].x);
                    coneAttributes.uv.value.push(uvs[0].y);
                    coneAttributes.indices.value.push(ix21);
                    ix21++;

                    // vertex 2
                    coneAttributes.vertices.value.push(cone.parent.vertex.x);
                    coneAttributes.vertices.value.push(cone.parent.vertex.y);
                    coneAttributes.vertices.value.push(cone.parent.vertex.z);
                    coneAttributes.radius.value.push(parent_radius);
                    coneAttributes.typeColor.value.push(node_color.r);
                    coneAttributes.typeColor.value.push(node_color.g);
                    coneAttributes.typeColor.value.push(node_color.b);
                    coneAttributes.normals.value.push(cone.normal2.x);
                    coneAttributes.normals.value.push(cone.normal2.y);
                    coneAttributes.normals.value.push(cone.normal2.z);
                    coneAttributes.uv.value.push(uvs[1].x);
                    coneAttributes.uv.value.push(uvs[1].y);
                    coneAttributes.indices.value.push(ix21);
                    ix21++;

                    // vertex 3
                    coneAttributes.vertices.value.push(cone.child.vertex.x);
                    coneAttributes.vertices.value.push(cone.child.vertex.y);
                    coneAttributes.vertices.value.push(cone.child.vertex.z);
                    coneAttributes.radius.value.push(parent_radius);
                    coneAttributes.typeColor.value.push(node_color.r);
                    coneAttributes.typeColor.value.push(node_color.g);
                    coneAttributes.typeColor.value.push(node_color.b);
                    coneAttributes.normals.value.push(cone.normal1.x);
                    coneAttributes.normals.value.push(cone.normal1.y);
                    coneAttributes.normals.value.push(cone.normal1.z);
                    coneAttributes.uv.value.push(uvs[2].x);
                    coneAttributes.uv.value.push(uvs[2].y);
                    coneAttributes.indices.value.push(ix21);
                    ix21++;
                }
            }
        }

        coneGeom.setIndex(new Uint32BufferAttribute(coneAttributes.indices.value, 1));
        coneGeom.addAttribute('position', new Float32BufferAttribute(coneAttributes.vertices.value, 3));
        coneGeom.addAttribute('radius', new Float32BufferAttribute(coneAttributes.radius.value, 1));
        coneGeom.addAttribute('typeColor', new Float32BufferAttribute(coneAttributes.typeColor.value, 3));
        coneGeom.addAttribute('normal', new Float32BufferAttribute(coneAttributes.normals.value, 3));
        coneGeom.addAttribute('uv', new Float32BufferAttribute(coneAttributes.uv.value, 2));

        const coneMaterial = new CompiledShaderMaterial(
            {
                uniforms: coneUniforms,
                vertexShader: this.Shader.PathShader.VertexShader,
                fragmentShader: this.Shader.PathShader.FragmentShader,
                transparent: true,
                depthTest: true,
                side: DoubleSide,
                alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
            });

        const coneMesh = new Mesh(coneGeom, coneMaterial);

        coneMaterial.onBeforeCompile = (shader) => {
            // console.log( shader )
            shader.uniforms.alpha = {value: 0};
            shader.vertexShader = 'uniform float alpha;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    'vAlpha = alpha'
                ].join('\n')
            );

            materialShader = shader;
            materialShader.uniforms.alpha.value = 0.9;

            coneMesh.userData = {materialShader};
        };

        neuron.add(coneMesh);

        return neuron;
    }

    public init(width: number | null, height: number | null) {
        this.renderer = new WebGLRenderer({
            antialias: true
        });
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.setSize(width || window.innerWidth, height || window.innerHeight);
        document.getElementById(this.ElementName).appendChild(this.renderer.domElement);

        // create a scene
        this.scene = new Scene();

        // put a camera in the scene
        this.fov = 45;

        const cameraPosition = -20000;
        this.camera = new PerspectiveCamera(this.fov, this.renderer.getSize().width / this.renderer.getSize().height, 1, cameraPosition * 5);

        this.scene.add(this.camera);

        this.camera.position.z = cameraPosition;

        this.camera.up.setY(-1);

        //Lights
        let light = new DirectionalLight(0xffffff);
        light.position.set(0, 0, 10000);
        this.scene.add(light);

        light = new DirectionalLight(0xffffff);
        light.position.set(0, 0, -10000);
        this.scene.add(light);

        this.trackControls = new OrbitControls(this.camera, document.getElementById(this.ElementName));
        this.trackControls.zoomSpeed = PreferencesManager.Instance.ZoomSpeed;
        this.trackControls.addEventListener('change', this.render.bind(this));

        this.raycaster.params.Points.threshold = DEFAULT_POINT_THRESHOLD;

        PreferencesManager.Instance.addListener({
            preferenceChanged: (name) => {
                if (name === "zoomSpeed") {
                    this.trackControls.zoomSpeed = PreferencesManager.Instance.ZoomSpeed;
                }
            }
        });
    }

    public addEventHandler(handler) {
        this.mouseHandler = handler;

        this.mouseHandler.DomElement = document.getElementById(this.ElementName);
        this.mouseHandler.addListeners();

        this.mouseHandler.ClickHandler = this.onClick;
        this.mouseHandler.ResetHandler = this.onResetView;
    }

    public onResetView = (r1, r2) => {
        this.trackControls.reset();
        this.trackControls.rotateLeft(r1);
        this.trackControls.rotateUp(r2);
        this.trackControls.update();
    };

    private onClick = (event) => {
        const rect = document.getElementById(this.ElementName).getBoundingClientRect();

        const mouse = new Vector2();

        mouse.x = ((event.clientX - rect.left) / this.renderer.getSize().width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / this.renderer.getSize().height) * 2 + 1;

        this.raycaster.setFromCamera(mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        const points = intersects.filter(o => o.object.type === "Points").filter(o => o.object.userData.materialShader.uniforms.alpha.value > 0.0).sort((a, b) => {
            return a.distanceToRay === b.distanceToRay ? a.distance - b.distance : a.distanceToRay - b.distanceToRay;
        });

        if (points.length > 0) {
            const intersectObject = points[0];

            if (event.altKey) {
                if (this.OnToggleNode) {
                    const sampleNumber = intersectObject.object.userData.indexLookup[intersectObject.index];
                    const tracingId = intersectObject.object.parent.name;

                    this.OnToggleNode(tracingId, sampleNumber);
                }
            } else {
                if (!event.shiftKey && !event.altKey && !event.ctrlKey) {
                    this.trackControls.target = points[0].point;
                }

                if (this.OnSelectNode) {
                    const sampleNumber = intersectObject.object.userData.indexLookup[intersectObject.index];
                    const tracingId = intersectObject.object.parent.name;

                    this.OnSelectNode(tracingId, sampleNumber, event);
                }
            }
        }
    };

    public animate = (timestamp = null) => {
        if (!this.last_anim_timestamp) {
            this.last_anim_timestamp = timestamp;
            this.render();
        } else if (timestamp - this.last_anim_timestamp > 50) {
            this.last_anim_timestamp = timestamp;
            this.trackControls.update();
            this.render();
        }

        window.requestAnimationFrame(this.animate);
    };


    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    public loadNeuron(filename, color, nodes) {
        const neuron = this.createNeuron(nodes, color);

        neuron.name = filename;

        this.scene.add(neuron);

        if (this.CenterPoint !== null) {
            neuron.position.set(-this.CenterPoint[0], -this.CenterPoint[1], -this.CenterPoint[2]);
        }
    };

    public unloadNeuron(filename) {
        const neuron = this.scene.getObjectByName(filename);
        this.scene.remove(neuron);
    };

    public setNeuronMirror(filename: string, mirror: boolean) {
        const neuron = this.scene.getObjectByName(filename);

        if (mirror && neuron.scale.x > 0) {
            neuron.scale.x = -1;
            neuron.position.x = this.CenterPoint[0];
        } else if (!mirror && neuron.scale.x < 0) {
            neuron.scale.x = 1;
            neuron.position.x = -this.CenterPoint[0];
        }
    };

    public setNeuronVisible(id: string, visible: boolean) {
        const neuron = this.scene.getObjectByName(id);

        if (neuron) {
            neuron.children.map(c => {
                if (c.userData.materialShader) {
                    c.userData.materialShader.uniforms.alpha.value = visible ? 1.0 : 0.0;
                }
            });
        }
    };

    public setNeuronDisplayLevel(id: string, opacity: number) {
        const neuron = this.scene.getObjectByName(id);

        if (neuron) {

            neuron.children.map(c => {
                if (c.userData.materialShader) {
                    c.userData.materialShader.uniforms.alpha.value = opacity;
                }
            });
        }
    };
    public setSize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.render();
    };

    public setBackground(color: number) {
        this.renderer.setClearColor(color, 1);
    }
}
