class Main_old {
	constructor(htmlCanvasID) {
		console.log('Class Main has been created!');
		this.tempres = 60;

		this.t = 0;

		this.c = document.getElementById(htmlCanvasID);
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