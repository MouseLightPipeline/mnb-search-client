import {NODE_PARTICLE_IMAGE} from "./util";
import {PreferencesManager} from "../util/preferencesManager";
import {SliceManager} from "../tomography/sliceManager";
import {SlicePlane} from "../tomography/sliceService";

const THREE = require("three");
require("three-obj-loader")(THREE);
const OrbitControls = require("ndb-three-orbit-controls")(THREE);

const DEFAULT_POINT_THRESHOLD = 50;

export class SharkViewer {
    /* swc neuron json object:
     *	{ id : {
     *		type: <type number of node (string)>,
     *		x: <x position of node (float)>,
     *		y: <y position of node (float)>,
     *		z: <z position of node (float)>,
     *		parent: <id number of node's parent (-1 if no parent)>,
     *		radius: <radius of node (float)>,
     *		}
     *	}
     */
    public swc = {};
    //html element that will receive webgl canvas
    public dom_element = 'container';
    //mode (sphere, particle, skeleton)
    public mode = 'particle';
    //height of canvas
    public HEIGHT = window.innerHeight;
    //width of canvas
    public WIDTH = window.innerWidth;
    //flip y axis
    public flip = true;
    //color array, nodes of type 0 show as first color, etc.
    public colors = [
        0x31ffdc,
        0x6d4ff3,
        0xaa3af0,
        0xf38032,
        0x59fc20,
        0xf8d43c,
        0xfd2c4d,
        0xc9c9c9,
    ];
    public radius_scale_factor = 1;
    public metadata = false;
    public centerpoint = null;
    public compartment_path = "/static/allen/obj/";
    public on_select_node = null;
    public on_toggle_node = null;

    private show_cones = true;
    private brainboundingbox = null;
    private last_anim_timestamp = null;
    private mouseHandler = null;
    private nodeParticleTexture = NODE_PARTICLE_IMAGE;
    private min_radius = null;
    private raycaster = new THREE.Raycaster();
    private trackControls = null;
    private backgroundColor = 0xffffff;
    private renderer = null;
    private scene = null;
    private camera = null;
    private sliceManager = null;

    /*
        private coronalPlane = null;
        private coronalTexture = null;
        private coronalMaskTexture = null;

        private horizontalPlane = null;
        private horizontalTexture = null;
        private horizontalMaskTexture = null;

        private sagittalPlane = null;
        private sagittalTexture = null;
        private sagittalMaskTexture = null;
    */
    public constructor() {
    }

    calculateBoundingBox = function (swc_json) {
        const boundingBox = {
            xmin: Infinity,
            xmax: -Infinity,
            ymin: Infinity,
            ymax: -Infinity,
            zmin: Infinity,
            zmax: -Infinity
        };

        for (const node in swc_json) {
            if (swc_json.hasOwnProperty(node)) {
                if (swc_json[node].x < boundingBox.xmin) boundingBox.xmin = swc_json[node].x;
                if (swc_json[node].x > boundingBox.xmax) boundingBox.xmax = swc_json[node].x;
                if (swc_json[node].y < boundingBox.ymin) boundingBox.ymin = swc_json[node].y;
                if (swc_json[node].y > boundingBox.ymax) boundingBox.ymax = swc_json[node].y;
                if (swc_json[node].z < boundingBox.zmin) boundingBox.zmin = swc_json[node].z;
                if (swc_json[node].z > boundingBox.zmax) boundingBox.zmax = swc_json[node].z;
            }
        }
        return boundingBox;
    };

    createMetadataElement = function (metadata, colors) {
        function convertToHexColor(i) {
            let result = "#000000";
            if (i >= 0 && i <= 15) {
                result = "#00000" + i.toString(16);
            } else if (i >= 16 && i <= 255) {
                result = "#0000" + i.toString(16);
            } else if (i >= 256 && i <= 4095) {
                result = "#000" + i.toString(16);
            } else if (i >= 4096 && i <= 65535) {
                result = "#00" + i.toString(16);
            } else if (i >= 65536 && i <= 1048575) {
                result = "#0" + i.toString(16);
            } else if (i >= 1048576 && i <= 16777215) {
                result = "#" + i.toString(16);
            }
            return result;
        }

        const metadiv = document.createElement('div');
        metadiv.id = 'node_key';
        metadiv.style.position = 'absolute';
        metadiv.style.top = '0px';
        metadiv.style.right = '10px';
        metadiv.style.border = "solid 1px #aaaaaa";
        metadiv.style.borderRadius = "5px";
        metadiv.style.padding = "2px";

        let toinnerhtml = "";
        metadata.forEach(function (m) {
            const mtype = parseInt(m.type);
            const three_color = (mtype < colors.length) ? colors[mtype] : colors[0];
            let css_color = three_color;
            if (typeof three_color !== 'string') css_color = convertToHexColor(three_color);
            toinnerhtml += "<div><span style='height:10px;width:10px;background:" + css_color +
                ";display:inline-block;'></span> : " + m.label + "</div>";
        });
        metadiv.innerHTML = toinnerhtml;
        return metadiv;
    };

//calculates camera position based on bounding box
    calculateCameraPosition = function (fov, center, boundingBox) {
        const x1 = Math.floor(center[0] - boundingBox.xmin) * 2;
        const x2 = Math.floor(boundingBox.xmax - center[0]) * 2;
        const y1 = Math.floor(center[1] - boundingBox.ymin) * 2;
        const y2 = Math.floor(boundingBox.ymax - center[1]) * 2;
        const max_bb = Math.max(x1, x2, y1, y2);
        //fudge factor 1.15 to ensure whole neuron fits
        return (max_bb / (Math.tan(fov * (Math.PI / 180.0) / 2) * 2)) * 1.15;
    };

//calculates color based on node type
    nodeColor = function (node) {
        if (node.type < this.three_colors.length) return this.three_colors[node.type];
        return this.three_colors[0];
    };

//generates sphere mesh
    generateSphere = function (node) {
        const sphereMaterial = this.three_materials[node.type];
        const r1 = node.radius || 0.01;
        const geometry = new THREE.SphereGeometry(r1);
        const mesh = new THREE.Mesh(geometry, sphereMaterial);
        mesh.position.x = node.x;
        mesh.position.y = node.y;
        mesh.position.z = node.z;
        return mesh;
    };

//generates cones connecting spheres
    generateConeGeometry = function (node, node_parent) {
        const coneMaterial = this.three_materials[node_parent.type];
        const node_vec = new THREE.Vector3(node.x, node.y, node.z);
        const node_parent_vec = new THREE.Vector3(node_parent.x, node_parent.y, node_parent.z);
        const dist = node_vec.distanceTo(node_parent_vec);
        const cylAxis = new THREE.Vector3().subVectors(node_vec, node_parent_vec);
        cylAxis.normalize();
        const theta = Math.acos(cylAxis.y);
        const rotationAxis = new THREE.Vector3();
        rotationAxis.crossVectors(cylAxis, new THREE.Vector3(0, 1, 0));
        rotationAxis.normalize();
        const r1 = node.radius || 0.01;
        const r2 = node_parent.radius || 0.01;
        const geometry = new THREE.CylinderGeometry(r1, r2, dist);
        const mesh = new THREE.Mesh(geometry, coneMaterial);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.makeRotationAxis(rotationAxis, -theta);
        const position = new THREE.Vector3((node.x + node_parent.x) / 2, (node.y + node_parent.y) / 2, (node.z + node_parent.z) / 2);
        mesh.matrix.setPosition(position);
        return mesh;
    };

//generates particle vertices
    generateParticle = function (node) {
        return new THREE.Vector3(node.x, node.y, node.z);
    };

//generates skeleton vertices
    generateSkeleton = function (node, node_parent) {
        const vertex = new THREE.Vector3(node.x, node.y, node.z);
        const vertex_parent = new THREE.Vector3(node_parent.x, node_parent.y, node_parent.z);
        return {
            'child': vertex,
            'parent': vertex_parent
        };
    };

//generates cone properties for node, parent pair
    generateCone = function (node, node_parent, color) {
        const cone_child: any = {};
        const cone_parent: any = {};

        let node_color = this.nodeColor(node);
        if (color) {
            node_color = new THREE.Color(color);
        }
        cone_child.vertex = new THREE.Vector3(node.x, node.y, node.z);
        cone_child.radius = node.radius;
        cone_child.color = node_color;

        let node_parent_color = this.nodeColor(node_parent);
        if (color) {
            node_parent_color = new THREE.Color(color);
        }
        cone_parent.vertex = new THREE.Vector3(node_parent.x, node_parent.y, node_parent.z);
        cone_parent.radius = node_parent.radius;
        cone_parent.color = node_parent_color;

        //normals
        const n1 = new THREE.Vector3().subVectors(cone_parent.vertex, cone_child.vertex);
        const n2 = n1.clone().negate();

        return {
            'child': cone_child,
            'parent': cone_parent,
            'normal1': n1,
            'normal2': n2
        };
    };

    createNeuron = function (swc_json, color = undefined) {
        //neuron is object 3d which ensures all components move together
        const neuron = new THREE.Object3D();
        let geometry, material;
        //particle mode uses vertex info to place texture image, very fast
        if (this.mode === 'particle') {
            // special imposter image contains:
            // 1 - colorizable sphere image in red channel
            // 2 - specular highlight in green channel
            // 3 - depth offset in blue channel (currently unused)
            const image = document.createElement('img');
            const sphereImg = new THREE.Texture(image);
            image.onload = function () {
                sphereImg.needsUpdate = true;
            };
            image.src = this.nodeParticleTexture;

            geometry = new THREE.BufferGeometry();
            // properties that may consty from particle to particle. only accessible in vertex shaders!
            //	(can pass color info to fragment shader via vColor.)
            // compute scale for particles, in pixels
            const particleScale = (0.5 * this.HEIGHT / this.renderer.getPixelRatio()) / Math.tan(0.5 * this.fov * Math.PI / 180.0);

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

            for (const node in swc_json) {
                if (swc_json.hasOwnProperty(node)) {
                    let node_color = this.nodeColor(swc_json[node]);

                    if (color) {
                        node_color = new THREE.Color(color);
                    }

                    let particle_vertex = this.generateParticle(swc_json[node]);

                    let radius = swc_json[node].radius * this.radius_scale_factor;

                    if (this.min_radius && radius < this.min_radius) {
                        radius = this.min_radius;
                    }

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
            geometry.addAttribute('position', new THREE.Float32BufferAttribute(customAttributes.vertices.value, 3));
            geometry.addAttribute('radius', new THREE.Float32BufferAttribute(customAttributes.radius.value, 1));
            geometry.addAttribute('typeColor', new THREE.Float32BufferAttribute(customAttributes.typeColor.value, 3));

            material = new THREE.ShaderMaterial(
                {
                    uniforms: customUniforms,
                    vertexShader: this.vertexShader,
                    fragmentShader: this.fragementShader,
                    transparent: true,
                    alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
                });
            material.extensions.fragDepth = true;


            let materialShader = null;

            const particles = new THREE.Points(geometry, material);
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

            if (this.show_cones) {
                // Cone quad imposters, to link spheres together
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
                    new THREE.Vector2(0.5, 0),
                    new THREE.Vector2(0.5, 1),
                    new THREE.Vector2(0.5, 1)
                ];
                const coneGeom = new THREE.BufferGeometry();
                let ix21 = 0;
                for (const node in swc_json) {
                    if (swc_json.hasOwnProperty(node)) {
                        if (swc_json[node].parent !== -1) {

                            const cnode = swc_json[node];
                            const pnode = swc_json[swc_json[node].parent];

                            // Paint two triangles to make a cone-imposter quadrilateral
                            // Triangle #1
                            const cone = this.generateCone(swc_json[node], swc_json[swc_json[node].parent], color);
                            let node_color = cone.child.color;
                            if (color) {
                                node_color = new THREE.Color(color);
                            }

                            let child_radius = cone.child.radius * this.radius_scale_factor;

                            if (this.min_radius && child_radius < this.min_radius) {
                                child_radius = this.min_radius;
                            }

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
                            node_color = cone.parent.color;
                            if (color) {
                                node_color = new THREE.Color(color);
                            }

                            let parent_radius = cone.parent.radius * this.radius_scale_factor;
                            if (this.min_radius && parent_radius < this.min_radius) {
                                parent_radius = this.min_radius;
                            }

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

                coneGeom.setIndex(new THREE.Uint32BufferAttribute(coneAttributes.indices.value, 1));
                coneGeom.addAttribute('position', new THREE.Float32BufferAttribute(coneAttributes.vertices.value, 3));
                coneGeom.addAttribute('radius', new THREE.Float32BufferAttribute(coneAttributes.radius.value, 1));
                coneGeom.addAttribute('typeColor', new THREE.Float32BufferAttribute(coneAttributes.typeColor.value, 3));
                coneGeom.addAttribute('normal', new THREE.Float32BufferAttribute(coneAttributes.normals.value, 3));
                coneGeom.addAttribute('uv', new THREE.Float32BufferAttribute(coneAttributes.uv.value, 2));

                const coneMaterial = new THREE.ShaderMaterial(
                    {
                        uniforms: coneUniforms,
                        vertexShader: this.vertexShaderCone,
                        fragmentShader: this.fragmentShaderCone,
                        transparent: true,
                        depthTest: true,
                        side: THREE.DoubleSide,
                        alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
                    });

                const coneMesh = new THREE.Mesh(coneGeom, coneMaterial);

                coneMaterial.onBeforeCompile = function (shader) {
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
            }
        }
        //sphere mode renders 3d sphere
        else if (this.mode === 'sphere') {
            for (const node in swc_json) {
                if (swc_json.hasOwnProperty(node)) {
                    const sphere = this.generateSphere(swc_json[node]);
                    neuron.add(sphere);
                    if (this.show_cones) {
                        if (swc_json[node].parent != -1) {
                            const cone = this.generateConeGeometry(swc_json[node], swc_json[swc_json[node].parent]);
                            neuron.add(cone);
                        }
                    }
                }
            }
        }

        if (this.mode === 'skeleton' || this.show_cones === false) {
            material = new THREE.LineBasicMaterial({color: this.colors[this.colors.length - 1]});
            if (this.mode === 'skeleton') material.color.set(this.colors[0]);
            geometry = new THREE.Geometry();
            for (const node in swc_json) {
                if (swc_json.hasOwnProperty(node)) {
                    if (swc_json[node].parent !== -1) {
                        const vertices = this.generateSkeleton(swc_json[node], swc_json[swc_json[node].parent]);
                        geometry.vertices.push(vertices.child);
                        geometry.vertices.push(vertices.parent);
                    }
                }
            }
            const line = new THREE.LineSegments(geometry, material);
            neuron.add(line);
        }
        return neuron;
    };

//Sets up three.js scene
    init = function () {
        this.vertexShader = [
            'uniform float particleScale;',
            'attribute float radius;',
            'attribute vec3 typeColor;',
            '//attribute float alpha;',
            'varying vec3 vColor;',
            '// varying vec4 mvPosition;',
            'varying float vAlpha;',
            'void main() ',
            '{',
            'vColor = vec3(typeColor); // set RGB color associated to vertex; use later in fragment shader.',
            'vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
            'vAlpha = alpha;',
            '// gl_PointSize = size;',
            'gl_PointSize = radius * ((particleScale*2.0) / length(mvPosition.z));',
            'gl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join("\n");

        this.fragementShader = [
            'uniform sampler2D sphereTexture; // Imposter image of sphere',
            'uniform mat4 projectionMatrix;',
            'varying vec3 vColor; // colors associated to vertices; assigned by vertex shader',
            '//varying vec4 mvPosition;',
            'varying float vAlpha;',
            'void main() ',
            '{',
            '// what part of the sphere image?',
            'vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);',
            'vec4 sphereColors = texture2D(sphereTexture, uv);',
            '// avoid further computation at invisible corners',
            'if (sphereColors.a < 0.3) discard;',
            'if (vAlpha < 0.05) discard;',

            '// calculates a color for the particle',
            '// gl_FragColor = vec4(vColor, 1.0);',
            '// sets a white particle texture to desired color',
            '// gl_FragColor = sqrt(gl_FragColor * texture2D(sphereTexture, uv)) + vec4(0.1, 0.1, 0.1, 0.0);',
            '// red channel contains colorizable sphere image',
            'vec3 baseColor = vColor * sphereColors.r;',
            '// green channel contains (white?) specular highlight',
            'vec3 highlightColor = baseColor + sphereColors.ggg;',
            'gl_FragColor = vec4(highlightColor, sphereColors.a * vAlpha);',
            '// TODO blue channel contains depth offset, but we cannot use gl_FragDepth in webgl?',
            '#ifdef GL_EXT_frag_depth',
            '// gl_FragDepthExt = 0.5;',
            '#endif',
            '}'
        ].join("\n");

        this.vertexShaderCone = [
            'attribute float radius;',
            'attribute vec3 typeColor;',
            '// attribute float alpha;',
            'varying vec3 vColor;',
            'varying vec2 sphereUv;',
            'varying float vAlpha;',
            'void main() ',
            '{',
            '   vAlpha = alpha;',
            '	// TODO - offset cone position for different sphere sizes',
            '	// TODO - implement depth buffer on Chrome',
            '	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
            '	// Expand quadrilateral perpendicular to both view/screen direction and cone axis',
            '	vec3 cylAxis = (modelViewMatrix * vec4(normal, 0.0)).xyz; // convert cone axis to camera space',
            '	vec3 sideDir = normalize(cross(vec3(0.0,0.0,-1.0), cylAxis));',
            '	mvPosition += vec4(radius * sideDir, 0.0);',
            '	gl_Position = projectionMatrix * mvPosition;',
            '	// Pass and interpolate color',
            '	vColor = typeColor;',
            '	// Texture coordinates',
            '	sphereUv = uv - vec2(0.5, 0.5); // map from [0,1] range to [-.5,.5], before rotation',
            '	// If sideDir is "up" on screen, make sure u is positive',
            '	float q = sideDir.y * sphereUv.y;',
            '	sphereUv.y = sign(q) * sphereUv.y;',
            '	// rotate texture coordinates to match cone orientation about z',
            '	float angle = atan(sideDir.x/sideDir.y);',
            '	float c = cos(angle);',
            '	float s = sin(angle);',
            '	mat2 rotMat = mat2(',
            '		c, -s, ',
            '		s,  c);',
            '	sphereUv = rotMat * sphereUv;',
            '	sphereUv += vec2(0.5, 0.5); // map back from [-.5,.5] => [0,1]',
            '}'
        ].join("\n");

        this.fragmentShaderCone = [
            'uniform sampler2D sphereTexture; // Imposter image of sphere',
            'varying vec3 vColor;',
            'varying vec2 sphereUv;',
            'varying float vAlpha;',
            'void main() ',
            '{',
            '   if (vAlpha < 0.05) discard;',
            '	vec4 sphereColors = texture2D(sphereTexture, sphereUv);',
            '	if (sphereColors.a < 0.3) discard;',
            '	vec3 baseColor = vColor * sphereColors.r;',
            '	vec3 highlightColor = baseColor + sphereColors.ggg;',
            '	gl_FragColor = vec4(highlightColor, sphereColors.a * vAlpha);',
            '}'
        ].join("\n");

        if (this.effect === 'noeffect') this.effect = false;

        //set up colors and materials based on color array
        this.three_colors = [];
        for (const color in this.colors) {
            if (this.colors.hasOwnProperty(color)) {
                this.three_colors.push(new THREE.Color(this.colors[color]));
            }
        }
        this.three_materials = [];
        for (const color in this.colors) {
            if (this.colors.hasOwnProperty(color)) {
                this.three_materials.push(new THREE.MeshBasicMaterial({color: this.colors[color]}));
            }
        }


        //setup render
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,	// to get smoother output
        });
        this.renderer.setClearColor(this.backgroundColor, 1);
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        document.getElementById(this.dom_element).appendChild(this.renderer.domElement);

        // create a scene
        this.scene = new THREE.Scene();

        // put a camera in the scene
        this.fov = 45;
        //const cameraPosition = this.calculateCameraPosition(fov);
        const cameraPosition = -20000;
        this.camera = new THREE.PerspectiveCamera(this.fov, this.WIDTH / this.HEIGHT, 1, cameraPosition * 5);
        // const cameraPosition = -2000;
        // this.camera = new THREE.OrthographicCamera(-5000, 5000, 5000, -5000, 1, cameraPosition * 5);
        this.scene.add(this.camera);

        this.camera.position.z = cameraPosition;

        // this.axes = buildAxes(10000);
        // this.scene.add(this.axes);

        if (this.flip === true) {
            this.camera.up.setY(-1);
        }

        this.neuron = this.createNeuron(this.swc);
        this.scene.add(this.neuron);


        //Lights
        //doesn't actually work with any of the current shaders
        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, 10000);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, -10000);
        this.scene.add(light);

        if (this.metadata) {
            const mElement = this.createMetadataElement(this.metadata, this.colors);
            document.getElementById(this.dom_element).appendChild(mElement);
        }

        this.trackControls = new OrbitControls(this.camera, document.getElementById(this.dom_element));
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

        this.sliceManager = new SliceManager("allen-reference", this.scene);
    };

    addEventHandler = function (handler) {
        this.mouseHandler = handler;
        this.mouseHandler.DomElement = document.getElementById(this.dom_element);
        this.mouseHandler.addListeners();
        this.mouseHandler.ClickHandler = this.onClick.bind(this);

        this.mouseHandler.ResetHandler = this.onResetView;
    };

    onResetView = (r1, r2) => {
        this.trackControls.reset();
        this.trackControls.rotateLeft(r1);
        this.trackControls.rotateUp(r2);
        this.trackControls.update();
    };

    onClick = function (event) {
        const rect = document.getElementById(this.dom_element).getBoundingClientRect();

        const mouse = new THREE.Vector2();

        mouse.x = ((event.clientX - rect.left) / this.WIDTH) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / this.HEIGHT) * 2 + 1;

        this.raycaster.setFromCamera(mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        const points = intersects.filter(o => o.object.type === "Points").filter(o => o.object.userData.materialShader.uniforms.alpha.value > 0.0).sort((a, b) => {
            return a.distanceToRay === b.distanceToRay ? a.distance - b.distance : a.distanceToRay - b.distanceToRay;
        });

        if (points.length > 0) {
            const intersectObject = points[0];

            if (event.altKey) {
                if (this.on_toggle_node) {
                    const sampleNumber = intersectObject.object.userData.indexLookup[intersectObject.index];
                    const tracingId = intersectObject.object.parent.name;

                    this.on_toggle_node(tracingId, sampleNumber);
                }
            } else {
                if (!event.shiftKey && !event.altKey && !event.ctrlKey) {
                    this.trackControls.target = points[0].point;

                    /*
                    const v1 = points[0].point.clone().project(this.camera);
                    const v2 = this.trackControls.target.clone().project(this.camera);

                    const wx = (v1.x + 1) / 2;
                    const wy = (-v1.y + 1) / 2;

                    const wl = wx * this.WIDTH;
                    const wt = wy * this.HEIGHT;

                    const yx = (v2.x + 1) / 2;
                    const yy = (-v2.y + 1) / 2;

                    const yl = yx * this.WIDTH;
                    const yt = yy * this.HEIGHT;

                    this.trackControls.pan(yl - wl, yt - wt);
                    */
                }

                if (this.on_select_node) {
                    const sampleNumber = intersectObject.object.userData.indexLookup[intersectObject.index];
                    const tracingId = intersectObject.object.parent.name;

                    this.on_select_node(tracingId, sampleNumber, event);
                }
            }
        }
    };

// animation loop
    animate = function (timestamp = null) {
        if (!this.last_anim_timestamp) {
            this.last_anim_timestamp = timestamp;
            this.render();
        } else if (timestamp - this.last_anim_timestamp > 50) {
            this.last_anim_timestamp = timestamp;
            this.trackControls.update();
            this.render();
        }

        window.requestAnimationFrame(this.animate.bind(this));
    };

// render the scene
    render = function () {
        this.renderer.render(this.scene, this.camera);
    };

    loadNeuron = function (filename, color, nodes) {
        const neuron = this.createNeuron(nodes, color);

        neuron.name = filename;

        this.scene.add(neuron);

        if (this.centerpoint !== null) {
            neuron.position.set(-this.centerpoint[0], -this.centerpoint[1], -this.centerpoint[2]);
        }
    };

    unloadNeuron = function (filename) {
        const neuron = this.scene.getObjectByName(filename);
        this.scene.remove(neuron);
    };

    setNeuronMirror = function (filename: string, mirror: boolean) {
        const neuron = this.scene.getObjectByName(filename);

        if (mirror && neuron.scale.x > 0) {
            neuron.scale.x = -1;
            neuron.position.x = this.centerpoint[0];
        } else if (!mirror && neuron.scale.x < 0) {
            neuron.scale.x = 1;
            neuron.position.x = -this.centerpoint[0];
        }
    };

    setNeuronVisible = function (id: string, visible: boolean) {
        const neuron = this.scene.getObjectByName(id);

        if (neuron) {
            neuron.children.map(c => {
                if (c.userData.materialShader) {
                    c.userData.materialShader.uniforms.alpha.value = visible ? 1.0 : 0.0;
                }
            });
        }
    };

    setNeuronDisplayLevel = function (id: string, opacity: number) {
        const neuron = this.scene.getObjectByName(id);

        if (neuron) {

            neuron.children.map(c => {
                if (c.userData.materialShader) {
                    c.userData.materialShader.uniforms.alpha.value = opacity;
                }
            });
        }
    };

    loadCompartment = function (id: string, geometryFile: string, color) {
        const loader = new THREE.OBJLoader();

        const that = this;

        const path = this.compartment_path + geometryFile;

        loader.load(path, (object) => {
            object.traverse(function (child) {
                child.material = new THREE.ShaderMaterial({
                    uniforms: {
                        color: {type: 'c', value: new THREE.Color('#' + color)},
                    },
                    vertexShader: `
					#line 585
					varying vec3 normal_in_camera;
					varying vec3 view_direction;

					void main() {
						vec4 pos_in_camera = modelViewMatrix * vec4(position, 1.0);
						gl_Position = projectionMatrix * pos_in_camera;
						normal_in_camera = normalize(mat3(modelViewMatrix) * normal);
						view_direction = normalize(pos_in_camera.xyz);
					}
				`,
                    fragmentShader: `
                	#line 597
                	uniform vec3 color;
					varying vec3 normal_in_camera;
					varying vec3 view_direction;

					void main() {
						// Make edges more opaque than center
						float edginess = 1.0 - abs(dot(normal_in_camera, view_direction));
						float opacity = clamp(edginess - 0.30, 0.0, 0.5);
						// Darken compartment at the very edge
						float blackness = pow(edginess, 4.0) - 0.3;
						vec3 c = mix(color, vec3(0,0,0), blackness);
						gl_FragColor = vec4(c, opacity);
					}
				`,
                    transparent: true,
                    depthTest: true,
                    depthWrite: false,
                    side: THREE.DoubleSide,
                });
            });

            object.name = id;

            if (that.centerpoint !== null) {
                object.position.set(-that.centerpoint[0], -that.centerpoint[1], -that.centerpoint[2]);
            }

            that.scene.add(object);

        });
    };

    unloadCompartment = function (id: string) {
        const selectedObj = this.scene.getObjectByName(id);
        this.scene.remove(selectedObj);
    };

    setCompartmentVisible = function (id: string, visible: boolean) {
        const compartment = this.scene.getObjectByName(id);

        if (compartment) {
            compartment.visible = visible;
        }
    };

    setSliceVisible = async (plane: SlicePlane, visible: boolean) => {
        if (visible) {
            await this.sliceManager.showSlice(plane);
        } else {
            this.sliceManager.hideSlice(plane);
        }
    };

    updateSlice = async (plane: SlicePlane, location: number) => {
        await this.sliceManager.updateSlice(plane, location);
    };

    /*
        private async createCoronalSlice() {
            const geometry = new THREE.PlaneGeometry(10400.0076, 7429.3582, 32);

            geometry.scale(1, -1, 1);

            this.coronalTexture = new THREE.Texture();
            this.coronalMaskTexture = new THREE.Texture();

            const material = this.createSliceMaterial(this.coronalTexture, this.coronalMaskTexture);

            const plane = new THREE.Mesh(geometry, material);

            this.scene.add(plane);


            const images = await requestSlice({
                sampleId: "sample-001",
                plane: SlicePlane.Coronal,
                coordinates: [0, 0, 6400]
            });

            if (images === null) {
                return;
            }

            this.coronalTexture.image = images[0];
            this.coronalTexture.needsUpdate = true;

            this.coronalMaskTexture.image = images[1];
            this.coronalMaskTexture.needsUpdate = true;
        }

        private createHorizontalSlice() {
            const geometry = new THREE.PlaneGeometry(10400.0076, 13187.6221, 32);

            geometry.rotateX(Math.PI/2);

            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                side: THREE.DoubleSide,
                opacity: 0.5,
                transparent: true,
                depthTest: false
            });

            const plane = new THREE.Mesh(geometry, material);

            this.scene.add(plane);
        }

        private createSagittalSlice() {
            const geometry = new THREE.PlaneGeometry(13187.6221, 7429.3582, 32);

            geometry.rotateY(Math.PI/2);

            const material = new THREE.MeshBasicMaterial({
                color: 0x0000ff,
                side: THREE.DoubleSide,
                opacity: 0.5,
                transparent: true,
                depthTest: false
            });

            const plane = new THREE.Mesh(geometry, material);

            this.scene.add(plane);
        }

        private createSliceMaterial(texture, maskTexture) {
            return new THREE.MeshBasicMaterial({
                map: texture,
                alphaMap: maskTexture,
                color: 0xffffff,
                side: THREE.DoubleSide,
                opacity: 0.9,
                transparent: true,
                depthTest: false
            });

        }

        loadSlice = async () => {
            const geometry = new THREE.PlaneGeometry(10400.0076, 7429.3582, 32);
            geometry.scale(1, -1, 1);

            const images = await requestSlice({
                sampleId: "sample-001",
                plane: SlicePlane.Coronal,
                coordinates: [0, 0, 6400]
            });

            if (images === null) {
                return;
            }

            const texture = new THREE.Texture();
            texture.image = images[0];
            texture.needsUpdate = true;

            const texture2 = new THREE.Texture();
            texture2.image = images[1];
            texture2.needsUpdate = true;

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                alphaMap: texture2,
                color: 0xffffff,
                side: THREE.DoubleSide,
                opacity: 1,
                transparent: true,
                depthTest: false
            });

            const plane = new THREE.Mesh(geometry, material);
            this.scene.add(plane);
        };
        */
    setSize = (width, height) => {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.HEIGHT = height;
        this.WIDTH = width;

        this.render();
    };

    setBackground = (color) => {
        this.backgroundColor = color;
        this.renderer.setClearColor(this.backgroundColor, 1);
    }
}
