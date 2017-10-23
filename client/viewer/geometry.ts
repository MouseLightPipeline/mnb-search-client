const THREE = require("three");

export function buildAxes(length) {
    const axes = new THREE.Object3D();

    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z

    return axes;
}

export function buildAxis(src, dst, colorHex, dashed) {
    const geom = new THREE.Geometry();

    let mat = dashed ? new THREE.LineDashedMaterial({
        linewidth: 3,
        color: colorHex,
        dashSize: 3,
        gapSize: 3
    }) : new THREE.LineBasicMaterial({linewidth: 3, color: colorHex});

    geom.vertices.push(src.clone());
    geom.vertices.push(dst.clone());

    geom.computeLineDistances(); // This is required, otherwise dashed lines will appear as simple plain lines

    return new THREE.Line(geom, mat);
}
