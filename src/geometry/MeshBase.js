/**
 * Base class to represent a triangle-faceted mesh
 */
class MeshBase {
    /**
     * 
     * @param {Object} options 
     */
    constructor(options) {
        this.vertices = options.vertices;   // array of vertices
        this.uvs = options.uvs;             // array of uv coordinates
        this.indices = options.indices;     // array of vertex indices forming the triangles
        this.options = {
            vertexStride: options.vertexStride,
            uvsStride: options.uvsStride
        };
    }

    /**
     * A number of spatial coordinates per each vertex
     * @returns {number} Vertex stride in the 'vertices' array
     */
    get vertexStride() {
        return this.options.vertexStride;
    }

    /**
     * A number of UV coodinates per vertex
     * @returns {number} UVs stride in the 'uvs' array
     */
    get uvsStride() {
        return this.options.uvsStride;
    }

    /**
     * A number of vertices per each facet
     * @returns {number} Stride of the 'indices' array
     */
    get indexStride() {
        return 3;
    }

    /**
     * Total vertices in the mesh
     * @returns {number}
     */
    get vertexCount() {
        return this.vertices.length / this.vertexStride;
    }

    /**
     * Total UV coordinates in the mesh
     * @returns {number} 
     */
    get uvsCount() {
        return this.uvs.length / this.uvsStride;
    }
}