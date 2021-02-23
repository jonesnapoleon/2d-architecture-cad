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
var polygonPoints = [];
var polygonColors = [];
var mouseClicked;
var isMoveX = false;
var isMoveY = false;
let movePointDetected = !true;
var width = 0.5;

canvas = document.getElementById("gl-canvas");
gl = WebGLUtils.setupWebGL(canvas);
var bufferId = gl.createBuffer();
var cBufferId = gl.createBuffer();

const resizeCanvas = (gl) => {
  gl.canvas.width = (9 / 12) * window.innerWidth;
  gl.canvas.height = (9 / 9) * window.innerHeight;
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

const setWidth = (e) => {
  const temp = parseInt(e.target.value);
  width = (10 * temp) / 1000 || 0.01;
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

const getIndex = (index) => {
  if (index === 0) return "L";
  if (index === 1) return "S";
  if (index === 2) return "P";
  return "";
};
const checkPointExist = (x = x, y = y) => {
  let temp = [linePoints, squarePoints, polygonPoints];
  for (let index in temp) {
    for (let i = 0; i < temp[index].length; i += 2) {
      const oneX = temp[index][i];
      const oneY = temp[index][i + 1];
      if (isCoordinateChoosen(oneX, oneY, x, y)) {
        movePointDetected = true;
        tempMove = [x, y];
        tempIndex = [i, i + 1, getIndex(parseInt(index))];
      }
    }
  }
};

let tempMove = [];
let tempIndex = [];
let moved;

const downloadToFile = (
  content,
  filename = "file.json",
  contentType = "json"
) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};
const saveProgress = () => {
  const data = {
    linePoints,
    lineColors,
    squareColors,
    squarePoints,
    polygonPoints,
    polygonColors,
  };
  downloadToFile(JSON.stringify(data));
};

const loadProgress = (e) => {
  const file = e.target.files[0];
  var reader = new FileReader();
  reader.addEventListener("load", function (e) {
    let data = e.target.result;
    data = JSON.parse(data);
    lineColors = data.lineColors;
    squareColors = data.squareColors;
    linePoints = data.linePoints;
    squarePoints = data.squarePoints;
    polygonPoints = data.polygonPoints;
    polygonColors = data.polygonColors;
    render();
  });
  reader.readAsBinaryString(file);
};

window.onload = function init() {
  if (!gl) alert("WebGL isn't available");
  resizeCanvas(gl);
  window.addEventListener("resize", () => resizeCanvas(gl), false);

  var shape = document.getElementById("menushape");
  shape.addEventListener("click", function (e) {
    shapeIndex = e.target.value;
  });

  var widthMark = document.getElementById("width");
  widthMark.addEventListener("change", (e) => setWidth(e));

  var m = document.getElementById("color-picker");
  m.addEventListener("change", (e) => getColor(e.target.value));

  let saveButton = document.getElementById("save");
  saveButton.addEventListener("click", saveProgress);

  let loadButton = document.getElementById("load");
  loadButton.addEventListener("change", loadProgress);

  let isMoveXCheckbox = document.getElementById("isMoveX");
  isMoveXCheckbox.addEventListener("change", (e) => {
    isMoveX = e.target.checked;
  });
  let isMoveYCheckbox = document.getElementById("isMoveY");
  isMoveYCheckbox.addEventListener("change", (e) => {
    isMoveY = e.target.checked;
  });

  var c = document.getElementById("clearButton");
  c.addEventListener("click", function () {
    linePoints = [];
    lineColors = [];
    squarePoints = [];
    squareColors = [];
    polygonPoints = [];
    polygonColors = [];
    render();
  });

  canvas.addEventListener("mousedown", (event) => {
    if (isMoveX || isMoveY) {
      moved = false;
      getPosition(event);
      checkPointExist(x, y);
    }
  });
  canvas.addEventListener("mousemove", () => {
    if (isMoveX || isMoveY) {
      moved = true;
    }
  });
  canvas.addEventListener("mouseup", (event) => {
    if ((isMoveX || isMoveY) && moved && movePointDetected) {
      getPosition(event);
      let array;
      if (tempIndex[2] === "L") array = linePoints;
      if (tempIndex[2] === "S") array = squarePoints;
      if (tempIndex[2] === "P") array = polygonPoints;
      if (isMoveX) array[tempIndex[0]] = x;
      if (isMoveY) array[tempIndex[1]] = y;
      render();
    }
  });

  canvas.addEventListener("click", function (event) {
    if (!isMoveX && !isMoveY) {
      if (shapeIndex == 0) {
        mouseClicked = false;
        getPosition(event);
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
      } else if (shapeIndex == 3) {
        var numPolygon = parseFloat(
          document.getElementById("nodePolygon").value
        );
        //Making default polygon
        if (numPolygon == 0) {
          mouseClicked = false;

          x = (2 * event.clientX) / canvas.width - 1;
          y = (2 * (canvas.height - event.clientY)) / canvas.height - 1;
          polygonPoints.push(x);
          polygonPoints.push(y);

          polygonPoints.push(x - width);
          polygonPoints.push(y + width);

          polygonPoints.push(x + width);
          polygonPoints.push(y + 2 * width);

          polygonPoints.push(x + 3 * width);
          polygonPoints.push(y + width);

          polygonPoints.push(x + 2 * width);
          polygonPoints.push(y);

          polygonColors.push(color);
          render();
        }
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

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(polygonPoints));

  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(polygonColors));
  if (polygonPoints.length != 0) {
    for (var i = 0; i <= polygonPoints.length / 5; i++) {
      gl.drawArrays(gl.POLYGON, 5 * i, 5);
    }
  }
}
