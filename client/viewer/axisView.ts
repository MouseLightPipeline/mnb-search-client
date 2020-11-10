import * as THREEM from "three";
import {PreferencesManager} from "../util/preferencesManager";
import {ICameraObserver} from "./shark_viewer";
import {Font} from "three";

const THREE = require("three");
const OrbitControls = require("ndb-three-orbit-controls")(THREE);
const fontJson = require("three/examples/fonts/helvetiker_regular.typeface.json");

export class AxisViewer implements ICameraObserver {
    public dom_element = 'container';

    //height of canvas
    public HEIGHT = window.innerHeight;
    //width of canvas
    public WIDTH = window.innerWidth;

    private backgroundColor = 0xffffff;
    private renderer = null;
    private scene = null;
    private camera = null;
    private fov: number = 1;
    private trackControls = null;
    private last_anim_timestamp = null;

    public get Scene(): THREEM.Scene {
        return this.scene;
    }

    public setSize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.HEIGHT = height;
        this.WIDTH = width;

        this.render();
    };

    public setBackground(color) {
        this.backgroundColor = color;
        this.renderer.setClearColor(this.backgroundColor, 1);
    }

    public init() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setClearColor(this.backgroundColor, 1);

        this.renderer.setSize(this.WIDTH, this.HEIGHT);

        document.getElementById(this.dom_element).appendChild(this.renderer.domElement);

        // create a scene
        this.scene = new THREE.Scene();

        // put a camera in the scene
        this.fov = 45;

        const cameraPosition = -20000;
        this.camera = new THREE.PerspectiveCamera(this.fov, this.WIDTH / this.HEIGHT, 1, cameraPosition * 5);

        this.scene.add(this.camera);

        this.camera.position.z = cameraPosition;

        this.camera.up.setY(-1);

        this.camera.lookAt(new THREE.Vector3());

        //Lights
        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, 10000);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, -10000);
        this.scene.add(light);

        this.loadAxes();
    }

    public animate = (timestamp = null) => {
        if (!this.last_anim_timestamp) {
            this.last_anim_timestamp = timestamp;
            this.render();
        } else if (timestamp - this.last_anim_timestamp > 50) {
            this.last_anim_timestamp = timestamp;
            this.render();
        }

        window.requestAnimationFrame(this.animate);
    };

    public void

    cameraChanged(camera: THREE.Camera) {
        if (this.camera) {
            this.camera.copy(camera);
        }
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    private loadAxes() {
        const axes = new THREE.AxisHelper(5000);

        this.scene.add(axes);

        const font = new THREE.Font(fontJson);

        const textGeo = new THREE.TextGeometry('Y', {
            size: 2500,
            height: 5,
            font: font,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
        });

        const color = new THREE.Color();
        color.setRGB(255, 0, 0);
        const textMaterial = new THREE.MeshBasicMaterial({color: color});
        const text = new THREE.Mesh(textGeo, textMaterial);
        /*
                console.log(axes.geometry);
                text.position.x = axes.geometry.vertices[1].x;
                text.position.y = axes.geometry.vertices[1].y;
                text.position.z = axes.geometry.vertices[1].z;
        */
        // text.rotation = this.camera.rotation;
        this.scene.add(text);
    }
}