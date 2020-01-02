import {NODE_PARTICLE_IMAGE} from "../util";
import {SystemShader} from "../shaders/shaders";
import {StandardShader} from "../shaders/standardShader";
import {
    BufferGeometry, Color,
    DoubleSide, Float32BufferAttribute,
    Mesh,
    Object3D,
    Points,
    Shader,
    ShaderMaterial,
    Texture,
    Uint32BufferAttribute, Vector2,
    Vector3
} from "three";
import {CompiledShaderMaterial} from "../shark_viewer";
import {ITracingGeometry} from "./tracingGeometry";

export class StandardTracingGeometry implements ITracingGeometry {
    public static Default = new StandardTracingGeometry();
    public static Shader: SystemShader = new StandardShader();

    private nodeParticleTexture = NODE_PARTICLE_IMAGE;

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

    public createNeuron(swc_json, particleScale: number, color: string) {
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

        ///// const particleScale = (0.5 * this.renderer.getSize().height / this.renderer.getPixelRatio()) / Math.tan(0.5 * this.fov * Math.PI / 180.0);

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

                let particle_vertex = StandardTracingGeometry.generateParticle(swc_json[node]);

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
                vertexShader: StandardTracingGeometry.Shader.NodeShader.VertexShader,
                fragmentShader: StandardTracingGeometry.Shader.NodeShader.FragmentShader,
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
                    const cone = StandardTracingGeometry.generateCone(swc_json[node], swc_json[swc_json[node].parent], node_color);

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
                vertexShader: StandardTracingGeometry.Shader.PathShader.VertexShader,
                fragmentShader: StandardTracingGeometry.Shader.PathShader.FragmentShader,
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
}
