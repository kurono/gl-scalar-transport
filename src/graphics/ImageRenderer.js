/**
 * Renders a quad of two triangles applying a fragment shader
 */
class ImageRenderer {
    /**
     * Creates a new ImageRenderer object
     * @param {View} view - The view associated with the renderer
     */
    constructor(view) {
        // public vars
        this.gl = null;
        this.view = view;
        this.image = null;

        this._currentShaderProgram = null;
        this._xyVertexAttribute = null;
        this._uvVertexAttribute = null;
        this._textureSampler0Uniform = null;

        this._tex = null;
        this._xyBuffer = null;
        this._indexBuffer = null;
        this._uvBuffer = null;
    }

    /**
     * Creates the WebGL rendering context.
     */
    createContext() {
        let gl = null;
        // depth and stencil should be True for mobile devices
        let attrs = {
            alpha: false,
            depth: true,
            stencil: true,
            antialias: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false
        };

        try {
            gl = this.view.canvas.getContext("webgl", attrs) || this.view.canvas.getContext("experimental-webgl", attrs);
            if (gl === null) {
                if (this.view.canvas.getContext("webgl") !== null) {
                    alert(`Error in "${this.constructor.name}": Improper webgl context attributes!`);
                } else {
                    alert(`Error in "${this.constructor.name}": Can't create webgl context!`);
                }
            }
        } catch(e) {
            alert(e.toString());
        }

        let ext = gl.getExtension("OES_texture_float");
        if (!ext) {
            alert(`Error in "${this.constructor.name}": 'OES_texture_float' is not supported!`);
            return;
        }
        let linear = gl.getExtension("OES_texture_float_linear");
        if (!linear) {
            alert(`Error in "${this.constructor.name}": 'OES_texture_float_linear' is not supported!`);
            return;
        }

        this.gl = gl;
    }

    /**
     * Sets the viewport dimensions
     */
    setViewport() {
        this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height);
    }

    /**
     * Clears the canvas
     */
    clear() {
        this.gl.clearColor(0.5, 0.5, 0.5, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    /**
     * Compiles the shaders using the provided Shader object
     * @param {Shader} shader - The Shader object containing vertex and fragment shaders
     */
    compileShaders(shader) {
        this._currentShaderProgram = shader.program;
        this._xyVertexAttribute = this.gl.getAttribLocation(this._currentShaderProgram, "vertexXY");
        this.gl.enableVertexAttribArray(this._xyVertexAttribute);
        this._uvVertexAttribute = this.gl.getAttribLocation(this._currentShaderProgram, "vertexUV");
        this.gl.enableVertexAttribArray(this._uvVertexAttribute);
        this._textureSampler0Uniform = this.gl.getUniformLocation(this._currentShaderProgram, "fs0");
    }

    /**
     * Initializes vertex and index buffers
     */
    initBuffers() {
        // vertex _xyBuffer
        this._xyBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._xyBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        // indices
        this._indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([2, 1, 0, 3, 2, 0]), this.gl.STATIC_DRAW);

        // uvs
        this._uvBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._uvBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), this.gl.STATIC_DRAW);
    }

    /**
     * Updates the texture with the provided image
     * @param {Image} image - The image to update the texture with
     */
    updateTexture(image) {
        this._tex = new TextureBase();
        this._tex.map = image;
        this._tex.update(this.gl);
    }

    /**
     * Renders the scene
     */
    render() {
        this.clear();

        if (this._currentShaderProgram === null) return;
        if (this._tex === null) return;
        if (this._tex.gpuTexture === null) return;

        this.gl.useProgram(this._currentShaderProgram);

        // vertex position
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._xyBuffer);
        this.gl.vertexAttribPointer(this._xyVertexAttribute, 2, this.gl.FLOAT, false, 0, 0);
        // uv
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._uvBuffer);
        this.gl.vertexAttribPointer(this._uvVertexAttribute, 2, this.gl.FLOAT, false, 0, 0);
        // indices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        // texture sampler 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._tex.gpuTexture);
        this.gl.uniform1i(this._textureSampler0Uniform, 0);

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0); // draw 2 triangles of a quad
        this.gl.flush();
    }
}