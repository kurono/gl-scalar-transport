/**
 * WebGL-based renderer
 */
class Renderer {
    /**
     * Creates a new instance of WebGL renderer
     * @param {HTMLCanvasElement} canvas 
     * @param {Object} options 
     */
    constructor(canvas, options) {
        this.canvas = canvas;
        this.gl = null;

        // depth and stencil should be True for mobile devices
        options = options || {
            alpha: false,
            depth: true,
            stencil: true,
            antialias: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false
        };

        try {
            this.gl = canvas.getContext("webgl", options) || 
                      canvas.getContext("experimental-webgl", options);
            if (this.gl === null) {
                if (canvas.getContext("webgl") !== null) {
                    throw new Error(`${Utils.getClassName(this)}: Improper webgl context attributes!`);
                } else {
                    throw new Error(`${Utils.getClassName(this)}: Can't create webgl context!`);
                }
            }
        } catch(e) {
            alert(e.toString());
        }
    }

    /**
     * Sets the viewport dimensions equal to the canvas this renderer belongs to
     */
    setViewport() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Clears the canvas
     * @param {} color An array of 3 floats in range [0 .. 1] representing RGB
     */
    clear(color = [0.5, 0.5, 0.5]) {
        this.gl.clearColor(color[0], color[1], color[2], 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}