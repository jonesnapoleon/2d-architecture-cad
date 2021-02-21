"use strict";

var canvas;
var gl;

var maxNumVertices = 20000;
var index = 0;
var x, y;
var sindex = 0;
var cindex = 0;
var lineColors = [];
var squareColors = [];
var polygonColors = [];
var colors = [
  [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0], // black
  [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0], // red
  [1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0], // yellow
  [0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0], // green
  [0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0], // blue
  [1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], // magenta
  [0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0], // cyan
];
var linePoints = [];
var squarePoints = [];
var polygonPoints = [];
var mouseClicked;

canvas = document.getElementById("gl-canvas");
gl = WebGLUtils.setupWebGL(canvas);
var bufferId = gl.createBuffer();
var cBufferId = gl.createBuffer();
window.onload = function init() {
  if (!gl) {
    alert("WebGL isn't available");
  }

  var shape = document.getElementById("menushape");

  shape.addEventListener("click", function () {
    sindex = shape.selectedIndex;
  });
  var m = document.getElementById("mymenu");

  m.addEventListener("click", function () {
    cindex = m.selectedIndex;
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

  canvas.addEventListener("mousedown", function (event) {
    if (sindex == 0) {
      mouseClicked = false;
      var width = 0.2;
      var val = parseFloat(document.getElementById("width").value);

      if (val != "0") {
        width = val;
      }
      console.log(width);
      x = (2 * event.clientX) / canvas.width - 1;
      y = (2 * (canvas.height - event.clientY)) / canvas.height - 1;
      linePoints.push(x);
      linePoints.push(y);

      linePoints.push(x + width);
      linePoints.push(y);
      lineColors.push(colors[cindex]);

      render();
    } else if (sindex == 1) {
      if (!mouseClicked) {
        x = (2 * event.clientX) / canvas.width - 1;
        y = (2 * (canvas.height - event.clientY)) / canvas.height - 1;
        mouseClicked = true;
      } else {
        linePoints.push(x);
        linePoints.push(y);
        linePoints.push((2 * event.clientX) / canvas.width - 1);
        linePoints.push(
          (2 * (canvas.height - event.clientY)) / canvas.height - 1
        );
        lineColors.push(colors[cindex]);
        mouseClicked = false;
        render();
      }
    } else if (sindex == 2) {
      mouseClicked = false;
      var width = 0.2;
      var val = parseFloat(document.getElementById("width").value);
      if (val != "0") {
        width = val;
      }
      console.log(width);
      x = (2 * event.clientX) / canvas.width - 1;
      y = (2 * (canvas.height - event.clientY)) / canvas.height - 1;
      squarePoints.push(x);
      squarePoints.push(y);

      squarePoints.push(x + width);
      squarePoints.push(y);

      squarePoints.push(x + width);
      squarePoints.push(y - width);

      squarePoints.push(x);
      squarePoints.push(y - width);

      squareColors.push(colors[cindex]);
      squareColors.push(colors[cindex]);

      render();
    } else if (sindex == 3) {
      //Making Polygon
      var numPolygon = parseFloat(document.getElementById("numPolygon").value);
      var width = 0.2;
      var val = parseFloat(document.getElementById("width").value);
      if (val != "0") {
        width = val;
      }

      //Making default polygon
      if (numPolygon == 0) {
        mouseClicked = false;

        console.log(width);
        x = (2 * event.clientX) / canvas.width - 1;
        y = (2 * (canvas.height - event.clientY)) / canvas.height - 1;
        linePoints.push(x);
        linePoints.push(y);

        linePoints.push(x - width);
        linePoints.push(y + width);

        linePoints.push(x + width);
        linePoints.push(y + 2 * width);

        linePoints.push(x + 3 * width);
        linePoints.push(y + width);

        linePoints.push(x + 2 * width);
        linePoints.push(y);

        lineColors.push(colors[cindex]);
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

function render(num) {
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

  // gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  // gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(linePoints));

  // gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  // gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(lineColors));
  // if (linePoints.length != 0) {
  //   for (var i = 0; i <= linePoints.length / 5; i++) {
  //     gl.drawArrays(gl.POLYGON, 5 * i, 5);
  //   }
  // }
}
