// ES6

/// ImageRenderer
class ImageRenderer {
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
					alert("improper webgl context attributes!");
				} else {
					alert("error creating webgl context");
				}
			}
		} catch(e) {
			alert(e.toString());
		}

		let ext = gl.getExtension("OES_texture_float");
		if (!ext) {
			alert("OES_texture_float not supported");
			return;
		}
		let linear = gl.getExtension("OES_texture_float_linear");
		if (!linear) {
			alert("OES_texture_float_linear not supported");
			return;
		}

		this.gl = gl;
	}

	setViewport() {
		this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height);
	}

	clear() {
		this.gl.clearColor(0.5, 0.5, 0.5, 1.0);
		//this.gl.enable(this.gl.DEPTH_TEST);
		//this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);// | this.gl.DEPTH_BUFFER_BIT);	
	}

	_createShader(src, type) {
		let shader = this.gl.createShader(type);

		this.gl.shaderSource(shader, src);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			alert(this.gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}

	compileShaders() {
		let vs_code =
			"    attribute vec2 vertexXY;				\n" +
			"    attribute vec2 vertexUV;				\n" +
			"    varying vec2 varUV;					\n" +
			"	 void main(void) {						\n" +
			"	 	 vec4 v = vec4(vertexXY, 0.0, 1.0);	\n" +
			"        gl_Position = v; 					\n" +
			"        varUV = vertexUV;					\n" +
			"    }										\n";

		let fs_code =
			"    precision highp float;				\n" +
			"	 uniform sampler2D fs0;					\n" +
			"    varying vec2 varUV;					\n" +
			"    void main(void) {						\n" +
			"       float L = 200.0;					\n" +
			"       float h = 1.0/L;					\n" +
			"		float dt = 0.001;				    \n" +
			"       float a = 0.005;					\n" +
			"		float x = varUV.x;					\n" +
			"       float y = varUV.y;					\n" +
			"       float R = pow(pow((x - 0.5),2.0) + pow((y - 0.5),2.0), 0.5) + 0.0001; \n" +
			"		float Vx = (y - 0.5)/R;						\n" +
			"		float Vy = - (x - 0.5)/R;					\n" +
			"		float uc = texture2D(fs0, vec2(x, y)).x;     	    \n" +
			"		float ut = texture2D(fs0, vec2(x, y + h)).x;		\n" +
			"		float ub = texture2D(fs0, vec2(x, y - h)).x;		\n" +
			"		float ul = texture2D(fs0, vec2(x - h, y)).x;		\n" +
			"		float ur = texture2D(fs0, vec2(x + h, y)).x;		\n" +
			"       float laplacian = (ut + ub + ul + ur - 4.0*uc)/(h*h); \n" +
			"       float dudx = (ur - ul)/(2.0*h); 	\n" +
			"       float dudy = (ut - ub)/(2.0*h); 	\n" +
			"       float convection = Vx * dudx + Vy * dudy; 		 \n" +
			"       float u = uc + dt*(a*laplacian - convection);  \n" +
			"       if (u > 1.0) u = 1.0;				\n" +
			"    	gl_FragColor = vec4(u, u, u, 1.0);	\n" +
			"}											\n";

		let vs = this._createShader(vs_code, this.gl.VERTEX_SHADER);
		let fs = this._createShader(fs_code, this.gl.FRAGMENT_SHADER);

		// link program
		this._currentShaderProgram = this.gl.createProgram();
		this.gl.attachShader(this._currentShaderProgram, vs);
		this.gl.attachShader(this._currentShaderProgram, fs);
		this.gl.linkProgram(this._currentShaderProgram);

		// attributes
		this._xyVertexAttribute = this.gl.getAttribLocation(this._currentShaderProgram, "vertexXY");
		this.gl.enableVertexAttribArray(this._xyVertexAttribute);
		this._uvVertexAttribute = this.gl.getAttribLocation(this._currentShaderProgram, "vertexUV");
		this.gl.enableVertexAttribArray(this._uvVertexAttribute);

		// uniforms
		this._textureSampler0Uniform = this.gl.getUniformLocation(this._currentShaderProgram, "fs0");

		if (!this.gl.getProgramParameter(this._currentShaderProgram, this.gl.LINK_STATUS)) {
			alert("initShaders:: failed!");
		}
	}

	initBuffers() {
		// vertex _xyBuffer
		this._xyBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._xyBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, 1,1, -1,1]), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

		// indices
		this._indexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([2,1,0, 3,2,0]), this.gl.STATIC_DRAW);

		// uvs
		this._uvBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._uvBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0,1, 1,1, 1,0, 0,0]), this.gl.STATIC_DRAW);
	}

	updateTexture(image) {
		this._tex = new TextureBase();
		this._tex.map = image;

		//console.log(this._tex.map);

		this._tex.update(this.gl);
	}

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

		//this.gl.enable(this.gl.CULL_FACE);
		//this.gl.cullFace(this.gl.BACK);

		this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0); // draw 2 triangles of a quad

		this.gl.flush();
	}
}

/// View
class View {
	constructor(canvas) {
		// public vars
		this.canvas = canvas;
		this.renderer = null;
	}

	init() {
		this.renderer = new ImageRenderer(this);
		this.renderer.createContext();
		this.renderer.setViewport();
		this.renderer.compileShaders();
		this.renderer.initBuffers();
	}
}

/// TextureBase
class TextureBase {
	constructor() {
		this.map = null;
		this.gpuTexture = null;
		this._gl = null;
	}

	update(gl) {

		this._gl = gl;

		this.gpuTexture = this._gl.createTexture();
		this._gl.bindTexture(this._gl.TEXTURE_2D, this.gpuTexture);
		/*//this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, true);
		this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this.map); // bind fs0
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);*/

		// for non-pot textures
		this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this.map); // bind fs0
		// gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
		// Prevents s-coordinate wrapping (repeating).
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
		// Prevents t-coordinate wrapping (repeating).
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

		this.gpuTexture.image = this.map;
	}
}


class Main {
	constructor() {
		console.log('Class Main has been created!');
		this.tempres = 60;

		this.t = 0;

		this.c = document.getElementById("glcanvas");
		this.view = new View(this.c);
		this.view.init();

		//alert(this.view.renderer.gl);
		this.view.renderer.clear();

		this.view.renderer.render();
	}

	updateRenderersTexture(canvasID = "tempcanvas") {
		let tempcanvas = document.getElementById(canvasID);
		this.view.renderer.updateTexture(tempcanvas);
	}

	getResultImageData() {
		let canvas = document.getElementById("glcanvas");
		let w = canvas.width;
		let h = canvas.height;
		let gl = canvas.getContext("webgl");
		let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
		gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

		return pixels;
	}

	generateArray() {
		let w = this.tempres;
		let h = this.tempres;
		let array = new Array(w * h);

		let x;
		let y;
		let index;
		let phix, phiy;
		let r = w/4;
		let rx = w*0.05;
		let ry = h*0.45;
		let p = 30.0;
		let c;
		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				index = x + y * w;
				phix = r * Math.cos(this.t);
				phiy = r * Math.sin(this.t);
				//array[index] = 0.5 * (Math.sin(x/3 - phix) + Math.cos(y/3 - phiy));
				c = Math.exp(-(Math.pow((x-w/2)/(rx),p) + Math.pow((y-h/2)/(ry),p)));
				array[index] = c;
			}
		}

		return array;
	}

	createImage(array2d, w, h) {
		let canvas = document.getElementById("tempcanvas"); // get handle to requested DOM element
		canvas.width = w;
		canvas.height = h;

		// get canvas' convext as 2D
		let ctx2d = canvas.getContext("2d");

		// preallocate texture data
		let tempImageData = ctx2d.createImageData(w, h);

		let x, y, index;

		// fill texture with colours from array2d
		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				index = x + y * w;
				tempImageData.data[4 * index + 0] = 255 * array2d[index]; 	// r
				tempImageData.data[4 * index + 1] = 255 * array2d[index]; 	// g
				tempImageData.data[4 * index + 2] = 255 * array2d[index]; 	// b
				tempImageData.data[4 * index + 3] = 255; 			// alpha
			}
		}

		// upload to canvas
		ctx2d.putImageData(tempImageData, 0, 0);
	}

	updateImage() {
		this.createImage(this.generateArray(), this.tempres, this.tempres);
	}

	getRenderedImageData() {
		let canvas = document.getElementById("glcanvas");
		let w = canvas.width;
		let h = canvas.height;
		let gl = canvas.getContext("webgl");
		let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
		gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	
		return pixels;
	}
	
	updateSecondCanvas() {
		let pixels = this.getRenderedImageData();
	
		//console.log(pixels);
	
		let w = 200, h = 200;
		
		let canvas = document.getElementById("glcanvas2"); // get handle to requested DOM element
		canvas.width = w;
		canvas.height = h;
	
		// get canvas' convext as 2D
		let ctx2d = canvas.getContext("2d");
	
		// preallocate texture data
		let tempImageData = ctx2d.createImageData(w, h);
	
		// fill texture with colours from array2d
		/*let i;
		for (i=0;i < pixels.length; i++) {
			tempImageData.data[i]   = pixels[i]; //<- causes vertically flipped image
		}*/

		// fill texture with colours from array2d
		let x, y, index, flipped_index;
		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				index = x + y * w;
				flipped_index = x + (h - 1 - y) * w;
				tempImageData.data[4*index+0] = pixels[4*flipped_index+0]; 	// r
				tempImageData.data[4*index+1] = pixels[4*flipped_index+1]; 	// g
				tempImageData.data[4*index+2] = pixels[4*flipped_index+2]; 	// b
				tempImageData.data[4*index+3] = pixels[4*flipped_index+3];  // alpha
			}
		}

		// upload to canvas
		ctx2d.putImageData(tempImageData, 0, 0);
	}
}



function init() {
	let main = new Main();
	
	// infinite loop
	onEnterFrame(main);
}

function updateDebugText(main) {
	let label = document.getElementById("debug");
	label.innerText = "Iteration: " + main.t;
} 


function onEnterFrame(main) {
	requestAnimationFrame(function() { onEnterFrame(main); });

	if (main.t < 2) main.updateImage();

	let canvasID = "tempcanvas";

	canvasID = (main.t < 2) ? "tempcanvas" : "glcanvas2";

	main.view.renderer.clear();

	main.updateRenderersTexture(canvasID);
	
	main.view.renderer.render();

	main.updateSecondCanvas();

	// next step
	main.t += 1.0;

	updateDebugText(main);
}

