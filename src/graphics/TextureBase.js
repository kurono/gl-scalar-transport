/**
 * Represents a TextureBase object responsible for managing textures in WebGL
 */
class TextureBase {
    /**
     * Creates a new instance of TextureBase
     */
    constructor() {
        // public
        this.map = null; // bitmap
        this.gpuTexture = null;
        // private
        this._gl = null;
    }

    /**
     * Updates the texture with the provided WebGL context.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context
     */
    update(gl) {
        this._gl = gl;

        this.gpuTexture = this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, this.gpuTexture);

        // for non-pot textures
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this.map); // bind fs0
        // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        // Prevents s-coordinate wrapping (repeating)
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        // Prevents t-coordinate wrapping (repeating)
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

        this.gpuTexture.image = this.map;
    }
}
