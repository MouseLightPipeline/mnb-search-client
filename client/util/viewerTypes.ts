export type Point3D = [number, number, number];
export type Range2D = [number, number];

export enum ViewerMeshVersion {
    Janelia,
    AibsCcf
}

export function ViewerMeshPath(version: ViewerMeshVersion): string {
    switch (version) {
        case ViewerMeshVersion.Janelia:
            return "/static/allen/obj/";
        default:
            return "/static/ccf-2017/obj/";
    }
}

export function ViewerMeshRotation(version: ViewerMeshVersion): number {
    switch (version) {
        case ViewerMeshVersion.AibsCcf:
            return -Math.PI / 2;
        default:
            return 0;
    }
}
