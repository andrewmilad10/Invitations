"use client";

import { useEffect, useRef } from "react";

/**
 * Gold light that travels along the embossed lines of the envelope (WebGL).
 * The texture holds the glow in red and, in green, the moment the light
 * reaches each point (computed from the art, from the ornament outwards along
 * every line). "idle": a soft gleam keeps flowing. "fill": the light fills
 * every line slowly. "dim": it settles to a faint gold.
 */
export type FlowMode = "idle" | "fill" | "dim";

const VS = "attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }";
const FS = `precision mediump float; varying vec2 uv; uniform sampler2D tex; uniform float t, idle, dim;
  void main(){ vec4 c = texture2D(tex, uv); float a = c.r, tm = c.g;
    float filled = 1. - smoothstep(t - .04, t + .01, tm);
    float head = exp(-pow((tm - t) / .03, 2.));
    float k = mix(filled * .95 + head * .9, head * .55, idle) * a * mix(1., .35, dim);
    vec3 col = mix(vec3(1., .86, .55), vec3(1., .97, .86), head);
    gl_FragColor = vec4(col * k, k); }`;

export function FlowCanvas({ src, mode, className }: { src: string; mode: FlowMode; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<{ mode: FlowMode; t0: number }>({ mode, t0: 0 });

  useEffect(() => {
    modeRef.current = { mode, t0: performance.now() };
  }, [mode]);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!canvas || !gl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sh = (type: number, code: string) => {
      const o = gl.createShader(type)!;
      gl.shaderSource(o, code);
      gl.compileShader(o);
      return o;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const ut = gl.getUniformLocation(pr, "t"), ui = gl.getUniformLocation(pr, "idle"), ud = gl.getUniformLocation(pr, "dim");
    const tex = gl.createTexture();
    let ready = false, raf = 0, alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      canvas.width = img.width;
      canvas.height = img.height;
      gl.viewport(0, 0, img.width, img.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
    };
    img.src = src;
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!ready) return;
      const { mode: m, t0 } = modeRef.current;
      const s = (now - t0) / 1000;
      let t = 1.1, idle = 0, dim = 0;
      if (m === "idle") {
        idle = 1;
        t = ((s % 8.5) / 8.5) * 1.25 - 0.1;
      } else if (m === "fill") t = reduced ? 1.1 : ease(Math.min(1, s / 4.6)) * 1.1;
      else dim = Math.min(1, s / 2.2);
      gl.uniform1f(ut, t);
      gl.uniform1f(ui, idle);
      gl.uniform1f(ud, dim);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
