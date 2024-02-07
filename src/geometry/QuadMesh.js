class QuadMesh extends MeshBase {
    constructor(options = null) {
        // override the options dictionary
        options = {
            vertices: [-1, -1, 1, -1, 1, 1, -1, 1],
            uvs: [0, 1, 1, 1, 1, 0, 0, 0],
            indices: [2, 1, 0, 3, 2, 0],
            vertexStride: 2,
            uvsStride: 2
        };

        super(options);
    }
}