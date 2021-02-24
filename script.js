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
var numPolygonDone = 0;
var arrayOfPolygonPoints = [];
var arrayOfPolygonColors = [];
var arrayOfNumPolygon = [];

var arrayOfSquarePoints = [];
var arrayOfSquareColors = [];

var arrayOfLinePoints = [];
var arrayOfLineColors = [];

canvas = document.getElementById("gl-canvas");
gl = WebGLUtils.setupWebGL(canvas);
var bufferId = gl.createBuffer();
var cBufferId = gl.createBuffer();

const resizeCanvas = (gl) => {
  gl.canvas.width = (9 / 12) * window.innerWidth;
  gl.canvas.height = (9 / 12) * window.innerWidth;
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
  let temp = [linePoints, squarePoints];
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
  for (let index in arrayOfPolygonPoints) {
    for (let i = 0; i < arrayOfPolygonPoints[index].length; i += 2) {
      const oneX = arrayOfPolygonPoints[index][i];
      const oneY = arrayOfPolygonPoints[index][i + 1];
      if (isCoordinateChoosen(oneX, oneY, x, y)) {
        movePointDetected = true;
        tempMove = [x, y];
        tempIndex = [i, i + 1, "P", index];
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
    arrayOfPolygonPoints,
    arrayOfPolygonColors,
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
    arrayOfPolygonPoints = data.arrayOfPolygonPoints;
    arrayOfPolygonColors = data.arrayOfPolygonColors;
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
    // linePoints = [];
    // lineColors = [];
    // squarePoints = [];
    // squareColors = [];
    // polygonPoints = [];
    // polygonColors = [];
    // arrayOfPolygonPoints = [];
    // arrayOfPolygonColors = [];
    // arrayOfNumPolygon = [];
    // numPolygonDone = 0;
    // render();
    location.reload();
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
      if (tempIndex[2] === "P") array = arrayOfPolygonPoints[tempIndex[3]];
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

        squarePoints.push(x + width);
        squarePoints.push(y);

        squarePoints.push(x);
        squarePoints.push(y);

        squarePoints.push(x + width);
        squarePoints.push(y - width);

        squarePoints.push(x);
        squarePoints.push(y - width);

        squareColors.push(color);
        squareColors.push(color);

        arrayOfSquarePoints.push(squarePoints);
        arrayOfSquareColors.push(squareColors);

        render();
      } else if (shapeIndex == 3) {
        // alert(numPolygonDone);
        var numPolygon = parseFloat(
          document.getElementById("nodePolygon").value
        );
        mouseClicked = false;

        // if (numPolygonDone == numPolygon) {
        //   numPolygonDone = 0;
        // }
        if (numPolygonDone < numPolygon - 1) {
          getPosition(event);
          polygonPoints.push(x);
          polygonPoints.push(y);
          polygonColors.push(color);
          polygonColors.push(color);
          numPolygonDone++;
        } else {
          numPolygon = parseFloat(document.getElementById("nodePolygon").value);
          getPosition(event);
          polygonPoints.push(x);
          polygonPoints.push(y);
          polygonColors.push(color);
          polygonColors.push(color);
          arrayOfPolygonPoints.push(polygonPoints);
          arrayOfPolygonColors.push(polygonColors);
          arrayOfNumPolygon.push(numPolygon);
          polygonPoints = [];
          polygonColors = [];
          // alert(arrayOfPolygonPoints);
          render();
          numPolygonDone = 0;

          // }
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
    for (var i = 0; i < linePoints.length / 2 - 1; i++) {
      gl.drawArrays(gl.LINES, 2 * i, 2);
    }
  }
  var m = 0;
  for (var j = 0; j < arrayOfSquarePoints.length; j++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfSquarePoints[j]));
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfSquareColors[j]));
    if (arrayOfSquarePoints[j].length != 0) {
      // for (var i = 0; i < arrayOfSquarePoints[j].length / 4 - 1; i++) {
      //   gl.drawArrays(gl.LINE_LOOP, 4 * i, 4);
      // }
      gl.drawArrays(gl.TRIANGLES, m, 4);
      gl.drawArrays(gl.TRIANGLES, m + 1, 4);
      m = m + 4;
    }
  }

  for (var j = 0; j < arrayOfPolygonPoints.length; j++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfPolygonPoints[j]));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfPolygonColors[j]));
    if (arrayOfPolygonPoints[j].length != 0) {
      for (
        var i = 0;
        i < arrayOfPolygonPoints[j].length / arrayOfNumPolygon[j] - 1;
        i++
      ) {
        gl.drawArrays(
          gl.LINE_LOOP,
          arrayOfNumPolygon[j] * i,
          arrayOfNumPolygon[j]
        );
      }
      numPolygonDone++;
    }
  }
}
