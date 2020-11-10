import * as THREEM from "three";
import {PreferencesManager} from "../util/preferencesManager";
const THREE = require("three");
const OrbitControls = require("ndb-three-orbit-controls")(THREE);

export class AxisViewer {
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

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    private loadAxes() {
        const axes = new THREE.AxisHelper(5000);
        this.scene.add(axes);
    }
}