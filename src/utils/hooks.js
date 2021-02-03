import { useLayoutEffect } from "react";
import { redraw } from "./main";

export const useInitCanvas = (shapeVertices) => {
  useLayoutEffect(() => {
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const resizeCanvas = () => {
      gl.canvas.width = (8 / 12) * window.innerWidth;
      gl.canvas.height = (9 / 9) * window.innerHeight;
      redraw(gl, shapeVertices);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, false);
  }, [shapeVertices]);
};
