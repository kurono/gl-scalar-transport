/**
 * GL texture object
 */
class Texture {
    /**
     * Create a new instance of Texture
     * @param {WebGLRenderingContext} gl WebGL context taken from the canvas element
     * @param {GLint} width Width 
     * @param {GLint} height Height
     * @param {Object} options Texture settings
     */
    constructor(gl, width, height, options) {
        this.gl = gl;
        this.framebuffer = null;
        
        this.id = this.gl.createTexture(); // allocate a texture object
        this.width = width;
        this.height = height;
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.id); // bind this texture object to a binding point
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1); // specify the pixel storage mode = true
        
        // set texture parameters: magnification and minification filters
        let magFilter = options.filter || options.magFilter || this.gl.LINEAR;
        let minFilter = options.filter || options.minFilter || this.gl.LINEAR;
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);
        
        // set texture parameters: wrapping function for texture coordinates s and t
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, options.wrap || options.wrapS || this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, options.wrap || options.wrapT || this.gl.CLAMP_TO_EDGE);
        
        // specify a 2D texture image:
        // the binding point (target) of the active texture, 
        // level of detail, 
        // internalformat specifying the color components in the texture, 
        // width, height, border, 
        // the format of the texel data, 
        // data type of the texel data,
        // a pixel source for the texture
        this.format = options.format || this.gl.RGBA;
        this.type = options.type || this.gl.UNSIGNED_BYTE;
        try {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, width, height, 0,
            this.format, this.type, options.data);
        } catch(e) {
            throw new Error(`${Utils.getClassName(this)}: can't create a texture!`);
        }
    }

    /**
     * Swap with another texture
     * @param {Texture} anotherTexture A texture to swap with
     */
    swap(anotherTexture) {
        let tmp;
        tmp = anotherTexture.id; 
        anotherTexture.id = this.id; 
        this.id = tmp;
        
        tmp = anotherTexture.width; 
        anotherTexture.width = this.width; 
        this.width = tmp;
        
        tmp = anotherTexture.height; 
        anotherTexture.height = this.height; 
        this.height = tmp;
    }

    /**
     * Bind this texture to the given texture unit (0-7, defaults to 0)
     * @param {GLint} unit Texture unit [0 .. 7]
     */
    bind(unit) {
        this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0)); // specifies which texture unit to make active
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    }

    /**
     * Clear the given texture 
     * @param {GLint} unit Texture unit [0 .. 7]
     */
    unbind(unit) {
        this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0)); // specifies which texture unit to make active
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    /**
     * Render all draw calls in 'callback' function to this texture
     * @param {Function} callback 
     */
    drawOntoIt(callback) {
        const view = this.gl.getParameter(this.gl.VIEWPORT); // Int32Array with 4 elements
        // create and initialize a WebGLFramebuffer object
        this.framebuffer = this.framebuffer || this.gl.createFramebuffer();

        // binds to the specified target the provided WebGLFramebuffer,
        // if null - the default WebGLFramebuffer, 
        // which is associated with the canvas rendering context
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);

        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.id, 0);
        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) != this.gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(
                `${Utils.getClassName(this)}: Incomplete framebuffer! Cant render to texture`);
        }
        this.gl.viewport(0, 0, this.width, this.height);

        callback();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.viewport(view[0], view[1], view[2], view[3]);  
    }

    static generateChecker() {
        const ctx2d = document.createElement('temp_canvas').getContext('2d');
        ctx2d.canvas.width = ctx2d.canvas.height = 64;
        const d = 8;
        for (let y = 0; y < c.canvas.height; y += 8) {
        for (let x = 0; x < c.canvas.width; x += 8) {
            ctx2d.fillStyle = (x ^ y) & d ? '#FFF' : '#DDD';
            ctx2d.fillRect(x, y, d, d);
        }
        }
        return ctx2d.canvas;
    }

    /**
     * Creates a texture from HTMLImageElement (Image)
     * @param {HTMLImageElement} image An instance of Image
     * @param {Object} options Texture settings
     * @returns {Texture} New texture object
     */
    static fromImage(gl, image, options) {
        options.data = image;
        const texture = new Texture(image.width, image.height, options);
        if (options.minFilter && 
            options.minFilter != this.gl.NEAREST && 
            options.minFilter != this.gl.LINEAR) {
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        }
        return texture;
    }


}