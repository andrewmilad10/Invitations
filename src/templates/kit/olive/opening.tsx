"use client";

/* eslint-disable @next/next/no-img-element -- registered envelope layers drawn at exact source size */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import ol from "./olive.module.css";
import s from "./opening.module.css";

/**
 * Olive Courtyard's opening. The sage envelope fills the screen and the camera
 * never moves. The flap is a real bending sheet drawn with WebGL (both faces
 * textured, the couple's initials painted in gold foil on it), so it curls up
 * from its point and turns back out of the top. The couple's invitation (the
 * page's first screen, full size) rises from behind the front of the envelope;
 * then the front slides away and the card is exactly the page underneath.
 * Design and flap renderer adapted from an external proposal for this opening.
 */
const BASE = "/templates/olive-courtyard/";
const PLAY = 4400;
const LEAVE = 240;
const W = 941, H = 1672, FH = 1038;
const ASSETS = ["closed.webp", "body.webp", "flap-front.webp", "flap-back.webp", "day.webp"];
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * t * (t * (t * 6 - 15) + 10); };
const segment = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The card: a copy of the page's first screen, with the page's own hero classes. */
function FirstScreen({ model }: { model: InvitationModel }) {
  const ar = model.locale === "ar";
  const hero = model.sections.find((x) => x.type === "hero")?.content as { eyebrow?: string } | undefined;
  return (
    <div className={s.hero} dir={ar ? "rtl" : "ltr"} aria-hidden>
      <span className={s.heroPic} />
      <div className={ol.heroText}>
        <p className={ol.caps}>{hero?.eyebrow || (ar ? "سنتزوّج" : "We are getting married")}</p>
        <h1 className={ol.heroH1}>
          <span>{model.wedding.partnerOne}</span>
          <span className={ol.amp}>{ar ? "و" : "&"}</span>
          <span>{model.wedding.partnerTwo}</span>
        </h1>
        {model.wedding.date?.short ? <p className={ol.heroDate}>{model.wedding.date.short}</p> : null}
      </div>
    </div>
  );
}

export function OliveOpening({ model }: { model: InvitationModel }) {
  return (
    <KitIntro model={model} className={s.overlay} timing={[PLAY, LEAVE]} label={model.strings.openInvitation}>
      {({ phase, open }) => <Scene model={model} phase={phase} open={open} />}
    </KitIntro>
  );
}

function loadImage(name: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.decode().then(() => resolve(image), reject);
    image.onerror = () => reject(new Error(`Cannot load ${name}`));
    image.src = BASE + name;
  });
}

function Scene({ model, phase, open }: { model: InvitationModel; phase: IntroPhase; open: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<ReturnType<typeof createFlap> | null>(null);
  const start = useRef<number | null>(null);
  const hasOpened = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const ar = model.locale === "ar";

  useEffect(() => {
    let live = true;
    const css = getComputedStyle(root.current!);
    const heading = css.getPropertyValue("--inv-font-heading").trim();
    const accent = css.getPropertyValue("--inv-font-accent").trim();
    const names = `${model.wedding.partnerOne} ${model.wedding.partnerTwo}`;
    // Wait for the theme's fonts (for the gold initials); a font that cannot be loaded this way never blocks the opening.
    const soft = (p: Promise<unknown>) => p.catch(() => undefined);
    const fonts = [
      soft(document.fonts.ready),
      heading ? soft(document.fonts.load(`64px ${heading}`, names + " & و")) : null,
      accent ? soft(document.fonts.load(`16px ${accent}`, ar ? "اضغطوا للفتح" : "TAP TO OPEN")) : null,
    ];
    const timer = window.setTimeout(() => { if (live) setFailed(true); }, 12000);
    Promise.all([Promise.all(ASSETS.map(loadImage)), Promise.all(fonts)])
      .then(([images]) => {
        if (!live) return;
        const a = Array.from(model.wedding.partnerOne.trim())[0] || "";
        const b = Array.from(model.wedding.partnerTwo.trim())[0] || "";
        renderer.current = createFlap(canvas.current!, images[2], images[3], `${a}${ar ? " و " : "&"}${b}`, css);
        renderer.current.draw(0);
        window.clearTimeout(timer);
        setFailed(false);
        setReady(true);
      })
      .catch((error) => {
        console.warn("Olive opening fallback:", error);
        if (live) setFailed(true);
      });
    return () => {
      live = false;
      window.clearTimeout(timer);
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [model.wedding.partnerOne, model.wedding.partnerTwo, ar]);

  useIsoLayoutEffect(() => {
    if (phase === "closed") {
      // a replay: back to the closed envelope
      hasOpened.current = false;
      start.current = null;
      root.current?.style.setProperty("--card-y", "100%");
      root.current?.style.setProperty("--envelope-y", "0%");
      renderer.current?.draw(0);
      return;
    }
    if (phase === "leaving" || phase === "done") {
      root.current?.style.setProperty("--card-y", "0%");
      root.current?.style.setProperty("--envelope-y", "110%");
      return;
    }
    let id = 0;
    start.current ??= performance.now();
    const frame = (now: number) => {
      const t = now - start.current!;
      const lift = segment(t, 1250, 2900);
      const exit = segment(t, 2900, 4150);
      root.current?.style.setProperty("--card-y", `${(1 - lift * 0.82) * (1 - exit) * 100}%`);
      root.current?.style.setProperty("--envelope-y", `${exit * 110}%`);
      renderer.current?.draw(segment(t, 0, 1900));
      if (t < PLAY) id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [phase]);

  useEffect(() => {
    const node = root.current;
    const cv = canvas.current;
    if (!node || !cv) return;
    let width = node.clientWidth, height = node.clientHeight;
    const onResize = new ResizeObserver(() => {
      if (node.clientWidth === width && node.clientHeight === height) return;
      width = node.clientWidth;
      height = node.clientHeight;
      if (!hasOpened.current) renderer.current?.draw(0);
    });
    onResize.observe(node);
    const lost = (event: Event) => { event.preventDefault(); setFailed(true); };
    cv.addEventListener("webglcontextlost", lost);
    return () => {
      onResize.disconnect();
      cv.removeEventListener("webglcontextlost", lost);
    };
  }, []);

  function begin() {
    if (hasOpened.current) return;
    if (!ready && !failed) return;
    hasOpened.current = true;
    start.current = performance.now();
    open();
  }

  return (
    <div ref={root} dir={ar ? "rtl" : "ltr"} className={s.scene} data-phase={phase} data-ready={ready} data-failed={failed || undefined}>
      <div className={s.rear} aria-hidden="true"><div className={s.imagePlane}><img src={BASE + "body.webp"} alt="" /></div></div>
      <div className={s.card}><FirstScreen model={model} /></div>
      <div className={s.pocket} aria-hidden="true"><div className={`${s.imagePlane} ${s.pocketCut}`}><img src={BASE + "body.webp"} alt="" /></div></div>
      <canvas ref={canvas} className={s.flap} aria-hidden="true" />
      <img className={s.closed} src={BASE + "closed.webp"} alt="" aria-hidden="true" />
      <ReadyMark phase={phase} />
      {phase === "closed" ? (
        <button type="button" className={s.open} onClick={begin} disabled={!ready && !failed} aria-busy={!ready && !failed} autoFocus>
          <span>{failed ? (ar ? "عرض الدعوة" : "View invitation") : ready ? (ar ? "اضغطوا للفتح" : "Tap to open") : (ar ? "جارٍ التحضير…" : "Preparing…")}</span>
        </button>
      ) : null}
    </div>
  );
}

/** The page is made ready under the opening, so it already matches the card when the opening lifts away. */
function ReadyMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="olive"]');
    if (!root) return;
    if (phase === "closed") {
      root.removeAttribute("data-ready");
      return;
    }
    const t = window.setTimeout(() => root.setAttribute("data-ready", ""), 300);
    return () => clearTimeout(t);
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function OliveReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

/* A 2-sided, 96-segment cylindrical paper surface. No moving camera, no 3D CSS. */
const VERTEX = `
attribute vec2 uv;
uniform vec2 viewport;
uniform vec3 crop;
uniform mediump float progress;
uniform mediump float shadowPass;
varying vec2 tex;
varying float normalZ;
void main() {
  float angle = progress * 3.14159265;
  float bend = 0.9 * sin(progress * 3.14159265);
  float v = uv.y;
  float y = 1038.0 * v * cos(angle);
  float z = 1038.0 * v * sin(angle);
  if (bend > 0.0001) {
    y = 1038.0 * (sin(angle + bend*v) - sin(angle)) / bend;
    z = 1038.0 * (cos(angle) - cos(angle + bend*v)) / bend;
  }
  normalZ = cos(angle + bend*v);
  // Fixed eye at 4500 image pixels; gentle perspective, never a camera zoom.
  float perspective = 4500.0 / (4500.0 - z);
  float x = (uv.x - 0.5) * 941.0;
  vec2 pixel = vec2(x * perspective + 470.5, y * perspective);
  if (shadowPass > 0.5) pixel = vec2(uv.x*941.0 + z*0.035, y + z*0.12);
  pixel = pixel * crop.x + crop.yz;
  gl_Position = vec4(pixel.x / viewport.x * 2.0 - 1.0, 1.0 - pixel.y / viewport.y * 2.0, 0.0, 1.0);
  tex = uv;
}`;
const FRAGMENT = `
precision mediump float;
uniform sampler2D front;
uniform sampler2D back;
uniform float shadowPass;
uniform float progress;
varying vec2 tex;
varying float normalZ;
void main() {
  vec4 outside = texture2D(front, tex);
  // The provided back asset is already flipped vertically for the OPEN pose.
  vec4 inside = texture2D(back, vec2(tex.x, 1.0-tex.y));
  float light = 0.70 + 0.30 * abs(normalZ);
  vec4 paper = normalZ >= 0.0 ? outside : inside;
  // Front alpha is the geometry silhouette on BOTH faces.
  paper.a = outside.a;
  if (shadowPass > 0.5) {
    float opacity = 0.19 * sin(progress*3.14159265) * (1.0-progress);
    vec2 d = vec2(0.012);
    float a = outside.a * 0.20;
    a += texture2D(front, tex + vec2(d.x,0.0)).a * 0.12;
    a += texture2D(front, tex - vec2(d.x,0.0)).a * 0.12;
    a += texture2D(front, tex + vec2(0.0,d.y)).a * 0.12;
    a += texture2D(front, tex - vec2(0.0,d.y)).a * 0.12;
    a += texture2D(front, tex + d).a * 0.08;
    a += texture2D(front, tex - d).a * 0.08;
    a += texture2D(front, tex + vec2(d.x,-d.y)).a * 0.08;
    a += texture2D(front, tex + vec2(-d.x,d.y)).a * 0.08;
    gl_FragColor = vec4(0.0, 0.0, 0.0, a*opacity);
  } else gl_FragColor = vec4(paper.rgb*light, paper.a);
}`;

function createFlap(canvas: HTMLCanvasElement, front: HTMLImageElement,
  back: HTMLImageElement, initials: string, css: CSSStyleDeclaration) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders: WebGLShader[] = [], buffers: WebGLBuffer[] = [], textures: WebGLTexture[] = [];
  let program: WebGLProgram | null = null;
  function dispose() {
    textures.forEach(t => gl!.deleteTexture(t)); buffers.forEach(b => gl!.deleteBuffer(b));
    shaders.forEach(sh => gl!.deleteShader(sh)); if (program) gl!.deleteProgram(program);
  }
  try {
    function compile(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) throw new Error("Shader allocation failed");
      shaders.push(shader); gl!.shaderSource(shader, source); gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || "Shader failed");
      return shader;
    }
    program = gl.createProgram();
    if (!program) throw new Error("Program allocation failed");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader linking failed");
    gl.useProgram(program);
    const vertices: number[] = [];
    for (let row = 0; row < 96; row++) {
      const a = row / 96, b = (row + 1) / 96;
      vertices.push(0,a, 1,a, 0,b, 0,b, 1,a, 1,b);
    }
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Buffer allocation failed");
    buffers.push(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const uv = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
    // Foil is painted into the OUTSIDE texture, so it bends with the paper.
    const foil = document.createElement("canvas"); foil.width = W; foil.height = FH;
    const ctx = foil.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    ctx.drawImage(front, 0, 0, W, FH);
    const ink = ctx.createLinearGradient(0, FH*.35, 0, FH*.49);
    ink.addColorStop(0, css.getPropertyValue("--foil-light").trim());
    ink.addColorStop(.48, css.getPropertyValue("--foil-mid").trim());
    ink.addColorStop(1, css.getPropertyValue("--foil-dark").trim());
    ctx.font = `72px ${css.getPropertyValue("--inv-font-heading").trim() || "serif"}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = ink;
    ctx.fillText(initials, W*.5, FH*.43, W*.65);
    [foil, back].forEach((source, index) => {
      const texture = gl.createTexture(); if (!texture) throw new Error("Texture allocation failed");
      textures.push(texture); gl.activeTexture(gl.TEXTURE0 + index); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    });
    const loc = (name: string) => gl.getUniformLocation(program!, name);
    const viewport = loc("viewport"), crop = loc("crop"), progress = loc("progress"), shadow = loc("shadowPass");
    gl.uniform1i(loc("front"), 0); gl.uniform1i(loc("back"), 1);
    gl.disable(gl.CULL_FACE); gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    function draw(p: number) {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      if (!width || !height || gl!.isContextLost()) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(width*dpr), ph = Math.round(height*dpr);
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      gl!.viewport(0, 0, pw, ph); gl!.clearColor(0,0,0,0); gl!.clear(gl!.COLOR_BUFFER_BIT);
      const scale = Math.max(width/W, height/H);
      gl!.uniform2f(viewport, width, height);
      gl!.uniform3f(crop, scale, (width-W*scale)/2, (height-H*scale)/2);
      gl!.uniform1f(progress, clamp(p));
      if (p >= 1) return;
      gl!.uniform1f(shadow, 1); gl!.drawArrays(gl!.TRIANGLES, 0, vertices.length/2);
      gl!.uniform1f(shadow, 0); gl!.drawArrays(gl!.TRIANGLES, 0, vertices.length/2);
    }
    return { draw, dispose };
  } catch (error) { dispose(); throw error; }
}
