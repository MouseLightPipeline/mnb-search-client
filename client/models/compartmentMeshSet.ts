export enum ViewerMeshVersion {
    Janelia,
    AibsCcf
}

export class CompartmentMeshSet {
    private readonly version: ViewerMeshVersion;

    public get Version(): ViewerMeshVersion {
        return this.version;
    }

    public get MeshPath(): string {
        switch (this.version) {
            case ViewerMeshVersion.Janelia:
                return "/static/allen/obj/";
            default:
                return "/static/ccf-2017/obj/";
        }
    }

    public get MeshRotation(): number {
        switch (this.version) {
            case ViewerMeshVersion.AibsCcf:
                return -Math.PI / 2;
            default:
                return 0;
        }
    }

    public constructor(v: ViewerMeshVersion) {
        this.version = v;
    }
}