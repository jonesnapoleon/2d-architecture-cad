"use strict";

var canvas;
var gl;
const maxNumVertices = 20000;

var x, y;
var color = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]; // black is default
var shapeIndex = 0;
var lineColors = [];
var squareColors = [];
var linePoints = [];
var squarePoints = [];
var mouseClicked;
var isMove = false;
let movePointDetected = !true;

canvas = document.getElementById("gl-canvas");
gl = WebGLUtils.setupWebGL(canvas);
var bufferId = gl.createBuffer();
var cBufferId = gl.createBuffer();

const resizeCanvas = (gl) => {
  gl.canvas.width = (10 / 12) * window.innerWidth;
  gl.canvas.height = (7 / 9) * window.innerHeight;
};

const getColor = (hex) => {
  const [_, rgb] = hex.split("#");
  const red = parseInt(rgb.slice(0, 2), 16);
  const green = parseInt(rgb.slice(2, 4), 16);
  const blue = parseInt(rgb.slice(4, 6), 16);
  const alpha = 1;
  color = [];
  for (let _ in [1, 2]) {
    for (let col of [red, green, blue]) {
      color.push(col / 255);
    }
    color.push(alpha);
  }
};

const getPosition = (event) => {
  x = (2 * event.clientX) / canvas.width - 1;
  y = (2 * (canvas.height - event.clientY)) / canvas.height - 1;
};
const isCoordinateChoosen = (oneX, oneY, x, y) => {
  const difX = Math.abs(oneX - x);
  const difY = Math.abs(oneY - y);
  return difX + difY < 0.1;
};

const checkPointExist = (x = x, y = y) => {
  for (let i = 0; i < linePoints.length; i += 4) {
    for (let j = i; j < i + 4; j += 2) {
      const oneX = linePoints[j];
      const oneY = linePoints[j + 1];
      if (isCoordinateChoosen(oneX, oneY, x, y)) {
        movePointDetected = true;
        tempMove = [x, y];
        tempIndex = [j, j + 1, "L"];
      }
    }
  }

  for (let i = 0; i < squarePoints.length; i += 8) {
    for (let j = i; j < i + 8; j += 2) {
      const oneX = squarePoints[j];
      const oneY = squarePoints[j + 1];
      if (isCoordinateChoosen(oneX, oneY, x, y)) {
        movePointDetected = true;
        tempMove = [x, y];
        tempIndex = [j, j + 1, "S"];
      }
    }
  }
};

let tempMove = [];
let tempIndex = [];
let moved;

let moveListener = () => {};

window.onload = function init() {
  if (!gl) alert("WebGL isn't available");
  resizeCanvas(gl);
  window.addEventListener("resize", () => resizeCanvas(gl), false);

  var shape = document.getElementById("menushape");
  shape.addEventListener("click", function (e) {
    shapeIndex = e.target.value;
  });

  var m = document.getElementById("color-picker");
  m.addEventListener("change", function (e) {
    getColor(e.target.value);
  });

  let isMoveCheckbox = document.getElementById("isMove");
  isMoveCheckbox.addEventListener("change", (e) => {
    isMove = e.target.checked;
  });

  var c = document.getElementById("clearButton");
  c.addEventListener("click", function () {
    linePoints = [];
    lineColors = [];
    squarePoints = [];
    squareColors = [];
    render();
  });

  canvas.addEventListener("mousedown", (event) => {
    if (isMove) {
      moved = false;
      getPosition(event);
      checkPointExist(x, y);
    }
  });
  canvas.addEventListener("mousemove", () => {
    if (isMove) {
      moved = true;
    }
  });
  canvas.addEventListener("mouseup", (event) => {
    if (isMove && moved && movePointDetected) {
      getPosition(event);
      let array;
      if (tempIndex[2] === "L") array = linePoints;
      if (tempIndex[2] === "S") array = squarePoints;
      array[tempIndex[0]] = x;
      array[tempIndex[1]] = y;
      render();
    }
  });

  canvas.addEventListener("click", function (event) {
    if (!isMove) {
      if (shapeIndex == 0) {
        mouseClicked = false;
        getPosition(event);
        var width = 0.2;
        var val = parseFloat(document.getElementById("width").value);
        if (val != "0") width = val;
        linePoints.push(x);
        linePoints.push(y);
        linePoints.push(x + width);
        linePoints.push(y);
        lineColors.push(color);
        render();
      } else if (shapeIndex == 1) {
        if (!mouseClicked) {
          getPosition(event);
          mouseClicked = true;
        } else {
          linePoints.push(x);
          linePoints.push(y);
          getPosition(event);
          linePoints.push(x);
          linePoints.push(y);
          lineColors.push(color);
          mouseClicked = false;
          render();
        }
      } else if (shapeIndex == 2) {
        mouseClicked = false;
        getPosition(event);
        var width = 0.2;
        var val = parseFloat(document.getElementById("width").value);
        if (val != "0") {
          width = val;
        }
        squarePoints.push(x);
        squarePoints.push(y);

        squarePoints.push(x + width);
        squarePoints.push(y);

        squarePoints.push(x + width);
        squarePoints.push(y - width);

        squarePoints.push(x);
        squarePoints.push(y - width);

        squareColors.push(color);
        squareColors.push(color);

        render();
      }
    }
  });

  // Konfigurasi  WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  //Load Data ke GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);
  var vPos = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPos);

  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);
  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(linePoints));
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(lineColors));

  if (linePoints.length != 0) {
    for (var i = 0; i <= linePoints.length / 2; i++) {
      gl.drawArrays(gl.LINES, 2 * i, 2);
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(squarePoints));
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(squareColors));
  if (squarePoints.length != 0) {
    for (var i = 0; i <= squarePoints.length / 4; i++) {
      gl.drawArrays(gl.LINE_LOOP, 4 * i, 4);
    }
  }
}

// window.onload = () => {
//   const canvas = document.getElementById("gl-canvas");
//   const gl = canvas.getContext("webgl");
//   if (!gl) return;

//   const resizeCanvas = () => {
//     gl.canvas.width = (10 / 12) * window.innerWidth;
//     gl.canvas.height = (9 / 9) * window.innerHeight;
//   };

//   redraw(gl);
//   resizeCanvas();
//   window.addEventListener("resize", resizeCanvas, false);
// };
