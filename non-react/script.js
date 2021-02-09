"use strict";

var canvas;
var gl;

var maxNumVertices = 20000;
var index = 0;
var x,y;
var cindex = 0;
var t = [];
var colors = [

  [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0], // black
  [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0], // red
  [1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0], // yellow
  [0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0], // green
  [0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0], // blue
  [1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], // magenta
  [0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0] // cyan
];
var points =[];
var mouseClicked;

canvas = document.getElementById("gl-canvas");
gl = WebGLUtils.setupWebGL(canvas);
var bufferId = gl.createBuffer();
var cBufferId = gl.createBuffer();
window.onload = function init() {
  

  
  if (!gl) {
    alert("WebGL isn't available");
  }

  var m = document.getElementById("mymenu");

  m.addEventListener("click", function() {
    cindex = m.selectedIndex;
  });

  var c = document.getElementById("clearButton")
  c.addEventListener("click", function(){
    points= [];
    t = [];
    render(); 
  });

  canvas.addEventListener("mousedown", function(event){
    if(!mouseClicked){
      
      x = 2 * event.clientX / canvas.width - 1
      y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
      mouseClicked = true;
      
    } else {
      points.push(x);
      points.push(y);
      points.push(2 * event.clientX / canvas.width - 1);
      points.push(2 * (canvas.height - event.clientY) / canvas.height - 1);
      t.push(colors[cindex]);
      mouseClicked = false;
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
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(t));
  if (points.length != 0){
    for (var i = 0; i <= points.length/2; i++) {
      gl.drawArrays(gl.LINES, 2*i,2);
    }
  }

  

  
}
