/**
 * Represents a Shader object responsible for compiling vertex and fragment shaders.
 */
class Shader {
    /**
     * Creates a new Shader object.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context
     * @param {string} vertexSourceCode - The source code of the vertex shader
     * @param {string} fragmentSourceCode - The source code of the fragment shader
     */
    constructor(gl, vertexSourceCode, fragmentSourceCode) {
        this.gl = gl;
        this.vs = this._createShader(vertexSourceCode, gl.VERTEX_SHADER);
        this.fs = this._createShader(fragmentSourceCode, gl.FRAGMENT_SHADER);
        this.program = this._createProgram();
    }

    /**
     * Compiles a shader from the provided source code
     * @private
     * @param {string} sourceCode - The source code of the shader
     * @param {number} type - The type of the shader (VERTEX_SHADER or FRAGMENT_SHADER)
     * @returns {WebGLShader} The compiled shader
     */
    _createShader(sourceCode, type) {
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, sourceCode);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    /**
     * Creates a shader program from the compiled vertex and fragment shaders
     * @private
     * @returns {WebGLProgram} The shader program
     */
    _createProgram() {
        let program = this.gl.createProgram();
        this.gl.attachShader(program, this.vs);
        this.gl.attachShader(program, this.fs);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            alert(`Error in "${this.constructor.name}": Shader program initialization failed!`);
            return null;
        }
        return program;
    }
}
