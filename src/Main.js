/**
 * Main class of the application
 */
class Main {
    constructor() {
        Logger.writeLine('Initialize renderer ...');
        const canvas = document.getElementById('gl-canvas');
        this.renderer = new Renderer(canvas);
        this.renderer.clear();
        Logger.writeLine('Renderer initialized!');

        const qm = new QuadMesh();
    }
}