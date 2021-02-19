"use strict";

var canvas;
var gl;

var maxNumVertices = 20000;
var index = 0;
var x,y;
var sindex = 0;
var cindex = 0;
var lineColors= [];
var squareColors = [];
var colors = [

  [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0], // black
  [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0], // red
  [1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0], // yellow
  [0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0], // green
  [0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0], // blue
  [1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], // magenta
  [0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0] // cyan
];
var linePoints =[];
var squarePoints = [];
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

  shape.addEventListener("click",function(){
    sindex = shape.selectedIndex;
  })
  var m = document.getElementById("mymenu");

  m.addEventListener("click", function() {
    cindex = m.selectedIndex;
  });

  var c = document.getElementById("clearButton")
  c.addEventListener("click", function(){
    linePoints= [];
    lineColors = [];
    squarePoints = [];
    squareColors= [];
    render(); 
  });

  canvas.addEventListener("mousedown", function(event){
    if (sindex == 0){
      if(!mouseClicked){
        x = 2 * event.clientX / canvas.width - 1
        y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        mouseClicked = true;
        
      } else {
        linePoints.push(x);
        linePoints.push(y);
        linePoints.push(2 * event.clientX / canvas.width - 1);
        linePoints.push(2 * (canvas.height - event.clientY) / canvas.height - 1);
        lineColors.push(colors[cindex]);
        mouseClicked = false;
        render();
          
      }
    } else if (sindex == 1){
      mouseClicked = false;
      var width = 0.2;
      
      x = 2 * event.clientX / canvas.width - 1
      y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
      squarePoints.push(x);
      squarePoints.push(y);

      squarePoints.push(x + width);
      squarePoints.push(y);

      squarePoints.push(x + width) ;
      squarePoints.push(y - width);

      squarePoints.push(x);
      squarePoints.push(y - width);

      squarePoints.push(x);
      squarePoints.push(y);

      squarePoints.push(x + width);
      squarePoints.push(y);

      squarePoints.push(x);
      squarePoints.push(y);

      squarePoints.push(x + width);
      squarePoints.push(y);

      squarePoints.push(x + width) ;
      squarePoints.push(y - width);

      squarePoints.push(x);
      squarePoints.push(y - width);

      squarePoints.push(x);
      squarePoints.push(y);

      squarePoints.push(x + width);
      squarePoints.push(y);

      

      squareColors.push(colors[cindex]);
      squareColors.push(colors[cindex]);
      squareColors.push(colors[cindex]);
      squareColors.push(colors[cindex]);
      squareColors.push(colors[cindex]);
      squareColors.push(colors[cindex]);

      render();
    }
    
  });

 

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  
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
  
  
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(linePoints));
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(lineColors));
  if (linePoints.length != 0){
    for (var i = 0; i <= linePoints.length/2; i++) {
      gl.drawArrays(gl.LINES, 2*i,2);
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(squarePoints));
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(squareColors));
  if (squarePoints.length != 0){
    for (var i = 0; i <= squarePoints.length/4; i++) {
      gl.drawArrays(gl.TRIANGLES, 4*i,4);
    }
  }

  

  
}
