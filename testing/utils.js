const vsSource = `
  precision mediump float;
  attribute vec2 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;
  void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0.5, 1.0);
  }
`;

const fsSource = `
  precision mediump float;
  varying vec3 fragColor;
  void main() {
    gl_FragColor = vec4(fragColor, 1.0);
  }
`;

export const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);

  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export const createBuffer = (gl, program, shapeVertices) => {
  const triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(shapeVertices),
    gl.STATIC_DRAW
  );

  const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  const colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};

export const redraw = (gl, shapeVertices) => {
  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.validateProgram(program);
  if (
    !gl.getProgramParameter(program, gl.LINK_STATUS) ||
    !gl.getProgramParameter(program, gl.VALIDATE_STATUS)
  ) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  createBuffer(gl, program, shapeVertices);
};

const triangleVertices = [
  0.0,
  0.5,
  1.0,
  1.0,
  0.0,

  -0.5,
  -0.5,
  1.0,
  0.0,
  1.0,

  0.5,
  -0.5,
  0.0,
  1.0,
  1.0,
];

// window.onload = () => {
//   const canvas = document.querySelector("#glCanvas");
//   const gl = canvas.getContext("webgl");
//   if (!gl) return;

//   const resizeCanvas = () => {
//     gl.canvas.width = (10 / 12) * window.innerWidth;
//     gl.canvas.height = (9 / 9) * window.innerHeight;
//     redraw(gl);
//   };

//   resizeCanvas();
//   window.addEventListener("resize", resizeCanvas, false);
// };
