function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");
  if (gl === null) return;

  const redraw = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  const resizeCanvas = () => {
    gl.canvas.width = (1 / 2) * window.innerWidth;
    gl.canvas.height = (9 / 9) * window.innerHeight;
    redraw();
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, false);
}

window.onload = main;
