class Main {
    constructor() {
        Logger.writeLine('Initialize renderer ...');
        const canvas = document.getElementById('glcanvas');
        this.renderer = new Renderer(canvas);
        this.renderer.clear();
        Logger.writeLine('Renderer initialized!');

        const qm = new QuadMesh();
    }
}