var gl;
var points;

// We want to run the function once the page is loaded
// i.e. it has importing other scripts
window.onload = function init() {
  // Gets the canvas context
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // Four Vertices
  // We use vec2 because MV.js uses vec2
  // The values here are in clip coordinates (see the next section)
  var vertices = [
    vec2(-0.5, -0.5),
    vec2(-0.5, 0.5),
    vec2(0.5, 0.5),
    vec2(0.5, -0.5),
  ];

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  // Get variable location in the program
  var vPosition = gl.getAttribLocation(program, "vPosition");
  // Connects the attribute to the shader
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Draw the triangles in a fan shape
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
