/**
 * A View object to manage the renderer
 */
class View {
    /**
     * Creates a new View object.
     * @param {HTMLCanvasElement} canvas - The HTML canvas element associated with the view.
     */
    constructor(canvas) {
        // public vars
        this.canvas = canvas;
        this.renderer = null;
    }

    /**
     * Initializes the view by creating the renderer, setting up the WebGL context,
     * viewport, compiling shaders, and initializing buffers
     */
    init() {
        this.renderer = new ImageRenderer(this);
        this.renderer.createContext();
        this.renderer.setViewport();
        this.renderer.compileShaders();
        this.renderer.initBuffers();
    }
}
