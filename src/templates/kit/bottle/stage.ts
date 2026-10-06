/**
 * Message in a Bottle — the live 3D scene (three.js), loaded only in the
 * browser for live and sample invitations.
 *
 * Golden hour on the open sea: moving clouds lit by a low sun, a glitter path
 * on the water, gulls gliding far off. A glass bottle with a wax-dipped cork
 * and twine round the neck bobs in a ring of foam. The guest can drag to look
 * around it; a tap and the camera closes in, the bottle lifts out with a
 * splash, the cork twists and pops, the letter slides out of the neck, turns
 * to the guest and unrolls (a vertex shader rolls the paper), and a wax seal
 * is pressed onto it. Then the letter rides up with the page and the light
 * goes from sunset to blue hour to a moonlit night with stars.
 *
 * Rendering: EffectComposer with bloom (the sun, glints), then a finishing
 * pass (vignette, a little grain and chromatic fringe) like a camera.
 */
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

export type StagePhase = "arrive" | "idle" | "open" | "read";
export interface StageText { eyebrow: string; lead: string; one: string; two: string; amp: string; date: string; place: string }
export interface StageFonts { script: string; serif: string; caps: string }
export interface StageOptions {
  text: StageText;
  fonts: StageFonts;
  reduced: boolean;
  sealUrl: string;
  onPhase: (p: StagePhase) => void;
  onTap: (x: number, y: number) => void;
  sound: { pop: () => void; rustle: (len: number) => void; splash?: () => void; thud?: () => void };
  /** seconds; tests pass a fixed clock */
  clock?: () => number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
};

const PW = 1.6, PH = 2.4, LETTER_Y = 1.75;
const SUN_START = 9, SUN_END = -10;
// sun elevation → zenith, mid sky, horizon, glow, cloud lit, cloud shade
const KEYS: [number, string, string, string, string, string, string][] = [
  [12, "#3c76b8", "#98b8d4", "#efe0cc", "#ffe2b0", "#fff6ea", "#a2b0c2"],
  [5, "#476ea4", "#aea7bb", "#f4cba4", "#ffc47a", "#ffdcbc", "#8e8ca6"],
  [0.5, "#344a7c", "#977f9f", "#eea477", "#ff9a52", "#ffb486", "#6b5a7a"],
  [-3.5, "#18244c", "#3e416c", "#7f5d7a", "#a8614f", "#c48277", "#383a5c"],
  [-10, "#050a1b", "#0b1430", "#182644", "#1c2b4c", "#3b4c70", "#0a1326"],
];

const NOISE = `
  float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
    return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return s; }`;

function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, srgb = false) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function waterNormals(N = 256) {
  const waves: number[][] = [];
  for (let i = 0; i < 28; i++) {
    const f = 2 + i * 1.3, a = Math.random() * 6.28;
    waves.push([Math.round(Math.cos(a) * f), Math.round(Math.sin(a) * f), Math.random() * 6.28, 1 / (1 + i * 0.45)]);
  }
  const h = (u: number, v: number) => waves.reduce((s, [a, b, p, amp]) => s + amp * Math.sin(6.2832 * (a * u + b * v) + p), 0);
  const t = canvasTex(N, N, (x) => {
    const id = x.createImageData(N, N);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const u = i / N, v = j / N, e = 1 / N;
        const dx = (h(u + e, v) - h(u - e, v)) * 0.9, dy = (h(u, v + e) - h(u, v - e)) * 0.9;
        const l = Math.hypot(dx, dy, 1), k = (j * N + i) * 4;
        id.data[k] = (-dx / l * 0.5 + 0.5) * 255;
        id.data[k + 1] = (-dy / l * 0.5 + 0.5) * 255;
        id.data[k + 2] = (1 / l * 0.5 + 0.5) * 255;
        id.data[k + 3] = 255;
      }
    x.putImageData(id, 0, 0);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

async function letterTexture(text: StageText, fonts: StageFonts, aniso: number) {
  await Promise.all([document.fonts.load(`400 120px ${fonts.script}`), document.fonts.load(`500 60px ${fonts.serif}`), document.fonts.load(`400 30px ${fonts.caps}`)]).catch(() => undefined);
  const W = 1024, H = 1536;
  const t = canvasTex(
    W,
    H,
    (x) => {
      x.fillStyle = "#f2e3c1";
      x.fillRect(0, 0, W, H);
      for (let i = 0; i < 320; i++) {
        const r = 30 + Math.random() * 170, g = x.createRadialGradient(0, 0, 0, 0, 0, r);
        const col = Math.random() < 0.42 ? "170,122,56" : "255,246,226";
        g.addColorStop(0, `rgba(${col},${0.04 + Math.random() * 0.1})`);
        g.addColorStop(1, `rgba(${col},0)`);
        x.save();
        x.translate(Math.random() * W, Math.random() * H);
        x.scale(1, 0.4 + Math.random() * 0.6);
        x.fillStyle = g;
        x.beginPath();
        x.arc(0, 0, r, 0, 7);
        x.fill();
        x.restore();
      }
      // fibres
      x.globalAlpha = 0.09;
      x.strokeStyle = "#6e4f25";
      for (let i = 0; i < 900; i++) {
        x.lineWidth = 0.4 + Math.random();
        x.beginPath();
        const a = Math.random() * W, b = Math.random() * H;
        x.moveTo(a, b);
        x.quadraticCurveTo(a + Math.random() * 30 - 15, b + Math.random() * 6 - 3, a + Math.random() * 60 - 30, b + Math.random() * 8 - 4);
        x.stroke();
      }
      x.globalAlpha = 1;
      // a sea-worn edge: darker, warmer towards the border
      const vg = x.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.74);
      vg.addColorStop(0, "rgba(120,80,30,0)");
      vg.addColorStop(1, "rgba(120,74,26,.38)");
      x.fillStyle = vg;
      x.fillRect(0, 0, W, H);
      // the words, in ink
      const fit = (str: string, max: number, size: number, font: (s: number) => string) => {
        let s = size;
        x.font = font(s);
        while (x.measureText(str).width > max && s > size * 0.4) {
          s -= 4;
          x.font = font(s);
        }
        return s;
      };
      x.textAlign = "center";
      x.shadowColor = "rgba(40,30,20,.25)";
      x.shadowBlur = 1.2;
      x.fillStyle = "#7b6440";
      fit(text.eyebrow.toUpperCase(), W * 0.8, 30, (s) => `400 ${s}px ${fonts.caps}`);
      x.fillText(text.eyebrow.toUpperCase(), W / 2, 300);
      x.fillStyle = "#2c3a44";
      fit(text.lead, W * 0.84, 76, (s) => `500 ${s}px ${fonts.serif}`);
      x.fillText(text.lead, W / 2, 410);
      x.fillStyle = "#1c2f42";
      const fs = Math.min(fit(text.one, W * 0.8, 150, (s) => `400 ${s}px ${fonts.script}`), fit(text.two, W * 0.8, 150, (s) => `400 ${s}px ${fonts.script}`));
      x.font = `400 ${fs}px ${fonts.script}`;
      x.fillText(text.one, W / 2, 600);
      x.font = `400 ${fs * 0.6}px ${fonts.script}`;
      x.fillText(text.amp, W / 2, 700);
      x.font = `400 ${fs}px ${fonts.script}`;
      x.fillText(text.two, W / 2, 840);
      x.shadowBlur = 0;
      x.strokeStyle = "#8a6f45";
      x.globalAlpha = 0.7;
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(W / 2 - 170, 940);
      x.lineTo(W / 2 + 170, 940);
      x.stroke();
      x.globalAlpha = 1;
      x.fillStyle = "#3b3427";
      for (const [line, y] of [[text.date, 1040], [text.place, 1108]] as [string, number][]) {
        if (!line) continue;
        fit(line, W * 0.84, 54, (s) => `500 ${s}px ${fonts.serif}`);
        x.fillText(line, W / 2, y);
      }
    },
    true,
  );
  t.anisotropy = aniso;
  return t;
}

const paperBump = () =>
  canvasTex(512, 768, (x) => {
    const id = x.createImageData(512, 768);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 200 + Math.random() * 55;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    x.globalAlpha = 0.25;
    x.strokeStyle = "#fff";
    for (let i = 0; i < 500; i++) {
      x.lineWidth = Math.random() * 1.4;
      x.beginPath();
      const a = Math.random() * 512, b = Math.random() * 768;
      x.moveTo(a, b);
      x.quadraticCurveTo(a + Math.random() * 40 - 20, b + Math.random() * 40 - 20, a + Math.random() * 70 - 35, b + Math.random() * 70 - 35);
      x.stroke();
    }
  });

const deckle = () =>
  canvasTex(256, 384, (x) => {
    const W = 256, H = 384;
    x.fillStyle = "#000";
    x.fillRect(0, 0, W, H);
    x.fillStyle = "#fff";
    x.beginPath();
    const j = () => (Math.random() - 0.5) * 3.4, m = 5;
    for (let i = 0; i <= W; i += 3) x.lineTo(i, m + j());
    for (let i = 0; i <= H; i += 3) x.lineTo(W - m + j(), i);
    for (let i = W; i >= 0; i -= 3) x.lineTo(i, H - m + j());
    for (let i = H; i >= 0; i -= 3) x.lineTo(m + j(), i);
    x.fill();
  });

const corkTexture = () =>
  canvasTex(
    128,
    128,
    (x) => {
      x.fillStyle = "#c49a63";
      x.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 700; i++) {
        x.fillStyle = Math.random() < 0.5 ? `rgba(110,72,35,${0.2 + Math.random() * 0.4})` : `rgba(235,200,150,${0.2 + Math.random() * 0.3})`;
        x.beginPath();
        x.ellipse(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2.5, 1 + Math.random() * 2, Math.random() * 3, 0, 7);
        x.fill();
      }
    },
    true,
  );

/** A gull: two wings that flap, seen from afar. */
function gull() {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: 0x2a2f38, side: THREE.DoubleSide, fog: false });
  const wing = (s: number) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, s * 0.55, 0.08, -0.06, s * 1.1, -0.04, 0.08, 0, 0, 0, s * 1.1, -0.04, 0.08, s * 0.5, 0, 0.18], 3));
    const w = new THREE.Mesh(geo, m);
    g.add(w);
    return w;
  };
  const l = wing(-1), r = wing(1);
  return { g, flap: (t: number) => ((l.rotation.z = Math.sin(t) * 0.55), (r.rotation.z = -Math.sin(t) * 0.55)) };
}

export function createStage(canvas: HTMLCanvasElement, o: StageOptions) {
  const mobile = matchMedia("(pointer: coarse)").matches;
  const now = o.clock ?? (() => performance.now() / 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  const dpr = Math.min(devicePixelRatio, mobile ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20000);

  // ── the sky: gradient, sun, moving clouds, a moon at night ──
  const skyU = {
    uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() },
    uLit: { value: new THREE.Color() }, uShade: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 0.1, -1) }, uMoon: { value: new THREE.Vector3(0.4, 0.35, -1).normalize() },
    uNight: { value: 0 }, uTime: { value: 0 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(9000, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: skyU,
      vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }",
      fragmentShader: `varying vec3 vDir; uniform vec3 uTop, uMid, uHor, uGlow, uLit, uShade, uSun, uMoon; uniform float uNight, uTime;
        ${NOISE}
        void main(){
          vec3 d = normalize(vDir); float h = max(d.y, 0.);
          vec3 c = mix(uHor, uMid, smoothstep(0., .16, h)); c = mix(c, uTop, smoothstep(.14, .7, h));
          float s = max(dot(d, normalize(uSun)), 0.);
          c += uGlow * (pow(s, 5.) * .28 + pow(s, 48.) * .7);
          // clouds on a plane above the sea
          vec2 uv = d.xz / (d.y + .08) * .55 + vec2(uTime * .006, uTime * .002);
          float n = fbm(uv * 1.3) * .7 + fbm(uv * 3.1 + 4.) * .3;
          float cov = smoothstep(.52, .8, n) * smoothstep(.015, .18, h) * (1. - smoothstep(.55, .9, h));
          float lit = pow(s, 3.) * .8 + .25 + (n - .5) * .6;
          vec3 cc = mix(uShade, uLit, clamp(lit, 0., 1.));
          cc += uGlow * pow(s, 12.) * (1. - smoothstep(.55, .8, n)) * 1.4;   // silver lining near the sun
          c = mix(c, cc, cov * .92);
          // the sun's disc (bloom makes the glare)
          c += vec3(1.6, 1.35, 1.0) * smoothstep(.99955, .9998, s) * (1. - cov * .85) * (1. - uNight);
          // the moon and its halo
          float m = max(dot(d, uMoon), 0.);
          c += uNight * (vec3(.9, .93, 1.) * smoothstep(.99965, .9998, m) * 1.4 + vec3(.25, .3, .45) * pow(m, 60.) * .5);
          if (d.y < 0.) c = mix(uHor, uHor * .6, smoothstep(0., -.25, d.y));
          gl_FragColor = vec4(c, 1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  scene.add(sky);
  const ca = new THREE.Color(), cb = new THREE.Color();
  const grade = (elev: number) => {
    let i = 0;
    while (i < KEYS.length - 2 && elev < KEYS[i + 1][0]) i++;
    const [e0, ...A] = KEYS[i], [e1, ...B] = KEYS[i + 1];
    const k = clamp((e0 - elev) / (e0 - e1));
    [skyU.uTop, skyU.uMid, skyU.uHor, skyU.uGlow, skyU.uLit, skyU.uShade].forEach((u, j) => u.value.copy(ca.set(A[j])).lerp(cb.set(B[j]), k).convertSRGBToLinear());
  };

  // ── the sea ──
  const water = new Water(new THREE.PlaneGeometry(10000, 10000), { textureWidth: mobile ? 384 : 768, textureHeight: mobile ? 384 : 768, waterNormals: waterNormals(), sunDirection: new THREE.Vector3(), sunColor: 0xffe2b8, waterColor: 0x0b5468, distortionScale: 3.2, fog: false });
  water.material.fragmentShader = water.material.fragmentShader
    .replace("float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );", "float reflectance = (rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 )) * 0.6;")
    .replace("sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );", "sunLight( surfaceNormal, eyeDirection, 220.0, 3.4, 0.5, diffuseLight, specularLight );");
  water.rotation.x = -Math.PI / 2;
  const wu = water.material.uniforms;
  wu.size.value = 1.6;
  scene.add(water);

  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT: THREE.WebGLRenderTarget | null = null;
  const skyScene = new THREE.Scene();
  const sunLight = new THREE.DirectionalLight(0xfff0dd, 2.4);
  scene.add(sunLight);
  const hemi = new THREE.HemisphereLight(0xfff0dc, 0x4f7480, 0.7);
  scene.add(hemi);
  const sun = new THREE.Vector3();
  let lastElev = 999;
  const setSun = (elev: number) => {
    sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elev), THREE.MathUtils.degToRad(172));
    skyU.uSun.value.copy(sun);
    grade(elev);
    const night = clamp((-elev - 3) / 5);
    skyU.uNight.value = night;
    wu.sunDirection.value.copy(elev > -3 ? sun : skyU.uMoon.value).normalize();
    sunLight.position.copy(sun).multiplyScalar(50);
    const warm = clamp(1 - elev / 12);
    sunLight.color.setHSL(0.085 - warm * 0.035, 0.65 + warm * 0.3, 0.64 - warm * 0.12);
    sunLight.intensity = lerp(2.4 * clamp((elev + 3) / 8, 0.12, 1), 0.5, night);
    hemi.intensity = lerp(0.3 + 0.5 * clamp((elev + 4) / 12), 0.22, night);
    hemi.color.setHSL(lerp(0.08, 0.62, night), 0.4, 0.82);
    const sc = wu.sunColor.value as THREE.Color;
    sc.setHSL(lerp(0.085 - warm * 0.04, 0.6, night), lerp(0.8, 0.3, night), lerp(0.78 - warm * 0.1, 0.75, night));
    (wu.waterColor.value as THREE.Color).set(0x0b5468).lerp(ca.set(0x041526), night);
    renderer.toneMappingExposure = lerp(1, 0.85, night);
    if (Math.abs(elev - lastElev) > 0.75) {
      lastElev = elev;
      skyScene.add(sky);
      envRT?.dispose();
      envRT = pmrem.fromScene(skyScene);
      scene.add(sky);
      scene.environment = envRT.texture;
    }
  };

  // stars
  const sp: number[] = [];
  for (let i = 0; i < 1400; i++) {
    const v = new THREE.Vector3().setFromSphericalCoords(8000, Math.acos(Math.random() * 0.92), Math.random() * 6.28);
    if (v.y > 150) sp.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: mobile ? 1.6 : 2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(stars);

  // gulls, far off
  const gulls = Array.from({ length: 5 }, (_, i) => {
    const b = gull();
    b.g.scale.setScalar(0.5 + Math.random() * 0.35);
    scene.add(b.g);
    return { ...b, r: 18 + i * 7, y: 5 + Math.random() * 5, ph: Math.random() * 6.28, sp: 0.05 + Math.random() * 0.04, fl: 5 + Math.random() * 2 };
  });

  // ── the letter: a plane that a vertex shader rolls up from the bottom edge ──
  const rollU = { uF: { value: PH / 2 }, uR0: { value: 0.045 }, uG: { value: 0.006 }, uH: { value: PH } };
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.42, roughness: 0.88, side: THREE.DoubleSide, alphaMap: deckle(), alphaTest: 0.5, envMapIntensity: 0.2, bumpMap: paperBump(), bumpScale: 0.6 });
  paperMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, rollU);
    sh.vertexShader =
      "uniform float uF, uR0, uG, uH;\n" +
      sh.vertexShader
        .replace(
          "#include <beginnormal_vertex>",
          `vec3 objectNormal = vec3(0.,0.,1.);
          float d = uF - position.y; float rolled = step(0., d);
          float L = uF + uH * .5;
          float R = uR0 + uG * max(0., L - d) / (6.2832 * uR0);
          float R0 = uR0 + uG * L / (6.2832 * uR0);
          float ang = d / R;
          vec3 rolledPos = vec3(position.x, uF - R * sin(ang), R0 - R * cos(ang));
          if (rolled > .5) objectNormal = vec3(0., sin(ang), cos(ang));`,
        )
        .replace("#include <begin_vertex>", "vec3 transformed = rolled > .5 ? rolledPos : vec3(position.xy, 0.);");
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <map_fragment>",
      `#ifdef USE_MAP
      vec4 sampledDiffuseColor = texture2D( map, vMapUv );
      if (!gl_FrontFacing) sampledDiffuseColor.rgb = texture2D( map, vec2(.06, vMapUv.y) ).rgb * vec3(.95,.91,.84);
      diffuseColor *= sampledDiffuseColor;
      #endif`,
    );
  };
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH, 1, 240), paperMat);
  const paperRig = new THREE.Group();
  paperRig.add(paper);
  let disposed = false;
  letterTexture(o.text, o.fonts, renderer.capabilities.getMaxAnisotropy()).then((t) => {
    if (disposed) return t.dispose();
    paperMat.map = t;
    paperMat.emissiveMap = t;
    paperMat.needsUpdate = true;
  });
  // the wax seal pressed onto the letter once it is open
  const sealTex = new THREE.TextureLoader().load(o.sealUrl);
  sealTex.colorSpace = THREE.SRGBColorSpace;
  const seal = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), new THREE.MeshBasicMaterial({ map: sealTex, transparent: true, depthWrite: false }));
  seal.position.set(0, -PH / 2 + 0.36, 0.006);
  seal.visible = false;
  paper.add(seal);

  // ── the bottle ──
  const bottle = new THREE.Group();
  const prof = [[0, -150], [44, -150], [50, -146], [52, -136], [52, 30], [50, 52], [40, 74], [24, 92], [17, 104], [16, 160], [19, 164], [20, 172], [17, 178]].map(([r, y]) => new THREE.Vector2(r * 0.0062, y * 0.0062));
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xeefcf6, transmission: 1, thickness: 0.24, roughness: 0.035, ior: 1.5, attenuationColor: new THREE.Color(0xa9e3d2), attenuationDistance: 2.6, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.8, specularIntensity: 1 });
  const glassMesh = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), glass);
  bottle.add(glassMesh);
  const corkTex = corkTexture();
  const cork = new THREE.Group();
  const corkBody = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.1, 0.3, 32), new THREE.MeshStandardMaterial({ map: corkTex, roughness: 0.9, bumpMap: corkTex, bumpScale: 2 }));
  const wax = new THREE.MeshPhysicalMaterial({ color: 0x8c2d22, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.4, sheenColor: new THREE.Color(0xc0503f) });
  const waxCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.135, 0.12, 32), wax);
  waxCap.position.y = 0.11;
  const waxDrip = new THREE.Mesh(new THREE.TorusGeometry(0.128, 0.03, 10, 32), wax);
  waxDrip.rotation.x = Math.PI / 2;
  waxDrip.position.y = 0.05;
  cork.add(corkBody, waxCap, waxDrip);
  const corkStart = new THREE.Vector3(0, 178 * 0.0062 + 0.05, 0);
  cork.position.copy(corkStart);
  bottle.add(cork);
  const twine = new THREE.MeshStandardMaterial({ color: 0xa27b4b, roughness: 0.95 });
  for (const [y, r] of [[0.66, 0.112], [0.7, 0.108]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 40), twine);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    bottle.add(ring);
  }
  const inside = new THREE.Group();
  inside.rotation.z = Math.PI / 2;
  bottle.add(inside);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 8, 40), twine);
  tie.rotation.y = Math.PI / 2;
  scene.add(bottle);

  // foam lapping at the bottle, and a splash ring when it lifts out
  const foamTex = canvasTex(256, 256, (x) => {
    const g = x.createRadialGradient(128, 128, 60, 128, 128, 126);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.55, "rgba(255,255,255,.55)");
    g.addColorStop(0.75, "rgba(255,255,255,.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 260; i++) {
      x.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
      const a = Math.random() * 6.28, r = 70 + Math.random() * 50;
      x.beginPath();
      x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, Math.random() * 3, 0, 7);
      x.fill();
    }
  });
  const foamMat = new THREE.MeshBasicMaterial({ map: foamTex, transparent: true, depthWrite: false, opacity: 0.7 });
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), foamMat);
  foam.rotation.x = -Math.PI / 2;
  scene.add(foam);
  const splashMat = foamMat.clone();
  splashMat.opacity = 0;
  const splash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), splashMat);
  splash.rotation.x = -Math.PI / 2;
  scene.add(splash);

  // droplets
  const dropV = Array.from({ length: 140 }, () => new THREE.Vector3());
  const drops = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xf2fdff, size: 0.03, transparent: true, opacity: 0, depthWrite: false }));
  drops.geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Array(dropV.length * 3).fill(-10), 3));
  scene.add(drops);
  let dropsOn = false;
  const spawnDrops = () => {
    const pos = drops.geometry.attributes.position as THREE.BufferAttribute, w = new THREE.Vector3();
    dropV.forEach((v, i) => {
      if (i < 50) {
        glassMesh.localToWorld(w.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.5));
        v.set((Math.random() - 0.5) * 0.25, -Math.random() * 0.3, (Math.random() - 0.5) * 0.25);
      } else {
        // the splash: thrown up and out from the water line
        const a = Math.random() * 6.28, r = 0.2 + Math.random() * 0.3;
        w.set(bottleRest.x + Math.cos(a) * r, 0.02, bottleRest.z + Math.sin(a) * r);
        v.set(Math.cos(a) * (0.4 + Math.random() * 0.6), 1.2 + Math.random() * 1.6, Math.sin(a) * (0.4 + Math.random() * 0.6));
      }
      pos.setXYZ(i, w.x, w.y, w.z);
    });
    pos.needsUpdate = true;
    dropsOn = true;
    drops.material.opacity = 0.95;
  };

  // ── post: bloom, then a camera finish ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.65, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAspect: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uAspect; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
      void main(){
        vec2 c = vUv - .5; float r = length(c * vec2(uAspect, 1.));
        vec2 off = c * .0022;
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        col *= 1. - smoothstep(.45, 1.15, r) * .38;
        col += (h(vUv * 800.) - .5) * .028;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  composer.addPass(finish);

  // ── layout ──
  let vw = 1, vh = 1, finalDist = 4;
  const resize = () => {
    vw = innerWidth;
    vh = innerHeight;
    renderer.setSize(vw, vh, false);
    composer.setSize(vw, vh);
    composer.setPixelRatio(dpr);
    bloom.resolution.set(vw * (mobile ? 0.25 : 0.5), vh * (mobile ? 0.25 : 0.5));
    finish.uniforms.uAspect.value = vw / vh;
    camera.aspect = vw / vh;
    camera.fov = camera.aspect < 0.8 ? 58 : 46;
    camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    finalDist = Math.max(PH / 0.8 / (2 * t), PW / 0.78 / (2 * t * camera.aspect));
  };
  addEventListener("resize", resize);
  resize();

  // ── the story ──
  let phase: StagePhase = "arrive", t0 = now(), openT = 0, detached = false;
  const flags = { pop: false, rustle: false, rustle2: false, drops: false, stamp: false };
  const LOOK = new THREE.Vector3(0, 0.25, 0);
  const CLOSE_CAM = new THREE.Vector3(0.25, 1.35, 3.9), CLOSE_LOOK = new THREE.Vector3(0, 1.15, 0.4);
  const camFrom = new THREE.Vector3(), bottleRest = new THREE.Vector3(0, 0.1, 0);
  const from = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 0.48 };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  // drag to look around the bottle (before opening); a still tap opens it
  const orbit = { a: 0, v: 0, down: false, lastX: 0, startX: 0, startY: 0, moved: false };
  const onDown = (e: PointerEvent) => {
    if (phase !== "idle" && phase !== "arrive") return;
    if ((e.target as Element | null)?.closest?.("button, a, input, [role=button]")) return;
    orbit.down = true;
    orbit.moved = false;
    orbit.lastX = orbit.startX = e.clientX;
    orbit.startY = e.clientY;
  };
  const onMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / vw) * 2 - 1;
    pointer.y = (e.clientY / vh) * 2 - 1;
    if (!orbit.down) return;
    const dx = e.clientX - orbit.lastX;
    orbit.lastX = e.clientX;
    if (Math.abs(e.clientX - orbit.startX) + Math.abs(e.clientY - orbit.startY) > 8) orbit.moved = true;
    orbit.v = (dx / vw) * 2.4;
    orbit.a = clamp(orbit.a + orbit.v, -0.7, 0.7);
  };
  const onUp = () => {
    if (orbit.down && !orbit.moved && phase === "idle") api.open();
    orbit.down = false;
  };
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    pointer.x = clamp(e.gamma / 25, -1, 1);
    pointer.y = clamp((e.beta - 45) / 30, -1, 1);
  };
  addEventListener("pointerdown", onDown);
  addEventListener("pointermove", onMove);
  addEventListener("pointerup", onUp);
  addEventListener("deviceorientation", onTilt);
  const setPhase = (p: StagePhase) => {
    phase = p;
    o.onPhase(p);
  };

  const letterIntoBottle = () => {
    rollU.uF.value = PH / 2;
    paper.position.set(0, -PH / 2, -0.075);
    paperRig.position.set(0, 0, 0);
    paperRig.rotation.set(0, 0, 0);
    paperRig.scale.setScalar(0.48);
    inside.add(paperRig);
    inside.position.y = -0.25;
    paperRig.add(tie);
    tie.position.set(0, 0, 0.02);
    tie.visible = true;
    tie.scale.setScalar(1);
    seal.visible = false;
    detached = false;
  };
  letterIntoBottle();

  const detachLetter = () => {
    paperRig.updateWorldMatrix(true, false);
    const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    paperRig.matrixWorld.decompose(p, q, s);
    scene.add(paperRig);
    paperRig.position.copy(p);
    paperRig.quaternion.copy(q);
    paperRig.scale.copy(s);
    from.pos.copy(p);
    from.quat.copy(q);
    from.scale = s.x;
    detached = true;
  };

  const target = new THREE.Vector3(), ident = new THREE.Quaternion(), tmp = new THREE.Vector3(), camA = new THREE.Vector3();
  const stepOpen = (t: number, dt: number) => {
    const a = ease.inOut(seg(t, 0, 1.4));
    bottle.position.lerpVectors(bottleRest, tmp.set(-0.1, 1.05, 0.4), a);
    bottle.rotation.set(lerp(0.12, 0.3, a), lerp(0.5, -0.35, a), lerp(-Math.PI / 2 + 0.22, -0.62, a));
    camera.position.lerpVectors(camFrom, CLOSE_CAM, a);
    LOOK.lerpVectors(tmp.set(0, 0.25, 0), CLOSE_LOOK, a);
    // leaving the water: a splash ring, droplets, the foam drifts apart
    if (t > 0.3 && !flags.drops) {
      flags.drops = true;
      spawnDrops();
      o.sound.splash?.();
    }
    const sp = seg(t, 0.3, 1.8);
    splash.position.set(bottleRest.x, 0.012, bottleRest.z);
    splash.scale.setScalar(0.6 + ease.out(sp) * 1.8);
    splashMat.opacity = sp > 0 ? (1 - sp) * 0.5 : 0;
    foamMat.opacity = 0.7 * (1 - seg(t, 0.2, 1.2));
    // the cork twists, then pops
    const tw = ease.inOut(seg(t, 1.3, 1.75));
    cork.rotation.y = tw * 3.4;
    cork.position.y = corkStart.y + tw * 0.06;
    const pop = seg(t, 1.75, 3.2);
    if (pop > 0) {
      if (!flags.pop) {
        flags.pop = true;
        o.sound.pop();
        navigator.vibrate?.(18);
      }
      cork.position.y = corkStart.y + 0.06 + pop * 2.2;
      cork.position.x = -pop * 1.6 + pop * pop * 2.4;
      cork.rotation.x = pop * 9;
    }
    // the letter slides out of the neck
    const out = ease.inOut(seg(t, 1.95, 3.0));
    if (!detached) inside.position.y = -0.25 + out * 1.95;
    if (t > 1.95 && !flags.rustle) {
      flags.rustle = true;
      o.sound.rustle(0.7);
    }
    if (t >= 3.0 && !detached) detachLetter();
    const sink = ease.inOut(seg(t, 3.0, 4.6));
    if (sink > 0) {
      bottle.position.y = lerp(1.05, -2.4, sink);
      bottle.position.x = lerp(-0.1, -1.4, sink);
      bottle.rotation.z += dt * 0.4;
    }
    // the letter turns to the guest, comes to the middle and grows
    if (detached) {
      const m = ease.inOut(seg(t, 3.0, 4.4));
      paperRig.position.lerpVectors(from.pos, target.set(0, LETTER_Y, 0), m);
      paperRig.quaternion.slerpQuaternions(from.quat, ident, m);
      paperRig.scale.setScalar(lerp(from.scale, 1, m));
      tie.scale.setScalar(Math.max(0.001, 1 - seg(t, 3.6, 4.1)));
      tie.visible = t < 4.1;
      const c = ease.inOut(seg(t, 3.0, 4.6));
      camera.position.lerpVectors(CLOSE_CAM, tmp.set(0, LETTER_Y - 0.1, finalDist), c);
      LOOK.lerpVectors(CLOSE_LOOK, target.set(0, LETTER_Y, 0), c);
    }
    // it unrolls
    const u = ease.inOut(seg(t, 4.3, 6.0));
    if (u > 0 && !flags.rustle2) {
      flags.rustle2 = true;
      o.sound.rustle(1.4);
    }
    rollU.uF.value = lerp(PH / 2, -PH / 2 - 0.02, u);
    paper.position.y = -(PH / 2 + rollU.uF.value) / 2;
    // and the seal is pressed on
    const st = seg(t, 6.0, 6.55);
    if (st > 0) {
      seal.visible = true;
      seal.scale.setScalar(lerp(1.9, 1, ease.back(st)));
      (seal.material as THREE.MeshBasicMaterial).opacity = clamp(st * 3);
      if (st >= 0.55 && !flags.stamp) {
        flags.stamp = true;
        o.sound.thud?.();
        navigator.vibrate?.(14);
      }
    }
    if (t > 6.7) setPhase("read");
  };

  // ── loop ──
  let last = now(), raf = 0;
  const tapPos = new THREE.Vector3();
  const frame = () => {
    const t = now(), dt = o.clock ? 1 / 60 : Math.min(0.05, t - last);
    last = t;
    wu.time.value += dt * 0.55;
    skyU.uTime.value = t;
    finish.uniforms.uTime.value = t % 10;
    pointer.sx = lerp(pointer.sx, pointer.x, 0.04);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.04);
    const swell = Math.sin(t * 1.1) * 0.05 + Math.sin(t * 0.63 + 1) * 0.035;
    // a hand-held camera breathes a little
    const hand = tmp.set(Math.sin(t * 0.7) * 0.012, Math.sin(t * 0.9 + 1) * 0.01, 0);
    let progress = 0;
    if (phase === "arrive" || phase === "idle") {
      const k = o.reduced ? 1 : ease.out(seg(t - t0, 0, 5));
      bottle.position.set(lerp(2.6, 0, k), 0.1 + swell, lerp(-16, 0, k));
      bottle.rotation.set(0.12 + Math.sin(t * 0.9) * 0.06, 0.5 + Math.sin(t * 0.4) * 0.1, -Math.PI / 2 + 0.22 + Math.sin(t * 1.1 + 0.5) * 0.07);
      bottleRest.copy(bottle.position);
      foam.position.set(bottle.position.x, 0.01, bottle.position.z);
      foam.scale.set(2.4 + Math.sin(t * 1.1) * 0.12, 1.5 + Math.sin(t * 1.3) * 0.08, 1);
      foam.rotation.z = 0.5;
      foamMat.opacity = 0.6 * k;
      if (!orbit.down) {
        orbit.v *= 0.92;
        orbit.a = clamp(orbit.a + orbit.v, -0.7, 0.7);
        orbit.a *= 0.995;
      }
      const ang = orbit.a + pointer.sx * 0.08, R = 4.6;
      camera.position.set(Math.sin(ang) * R, 1.6 - pointer.sy * 0.12 + Math.sin(t * 0.7) * 0.025, Math.cos(ang) * R).add(hand);
      LOOK.set(bottle.position.x * 0.4, 0.25, bottle.position.z * 0.3);
      if (phase === "arrive" && k > 0.82) setPhase("idle");
      tapPos.copy(bottle.position).setY(bottle.position.y + 0.1).project(camera);
      o.onTap((tapPos.x * 0.5 + 0.5) * vw, (-tapPos.y * 0.5 + 0.5) * vh);
    } else if (phase === "open") {
      stepOpen(o.reduced ? 99 : t - openT, dt);
      camera.position.add(hand);
    } else {
      // the letter is fixed to the page and scrolls up with it; the light goes as the guest reads
      const perPx = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * finalDist) / vh;
      paperRig.position.y = LETTER_Y + scrollY * perPx;
      paperRig.rotation.x = -clamp(scrollY / vh) * 0.35;
      camA.set(pointer.sx * 0.12, LETTER_Y - 0.1 - pointer.sy * 0.05, finalDist).add(hand);
      camera.position.copy(camA);
      LOOK.set(0, LETTER_Y + clamp(scrollY / vh) * 0.9, 0);
      progress = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - vh));
    }
    setSun(lerp(SUN_START, SUN_END, progress));
    stars.material.opacity = clamp((progress - 0.55) * 2.6) * 0.9;
    stars.rotation.y = t * 0.002;
    gulls.forEach((b, i) => {
      const a = b.ph + t * b.sp * (i % 2 ? 1 : -1);
      b.g.position.set(Math.sin(a) * b.r, b.y + Math.sin(t * 0.5 + i) * 0.4, -30 - Math.cos(a) * b.r * 0.6);
      b.g.rotation.y = a + (i % 2 ? Math.PI / 2 : -Math.PI / 2);
      const glide = Math.sin(t * 0.3 + i) > 0.3;
      b.flap(glide ? 0.25 : t * b.fl);
      b.g.visible = progress < 0.6;
    });
    if (dropsOn) {
      const pos = drops.geometry.attributes.position as THREE.BufferAttribute;
      dropV.forEach((v, i) => {
        v.y -= 9.8 * dt * 0.6;
        const y = pos.getY(i) + v.y * dt;
        pos.setXYZ(i, pos.getX(i) + v.x * dt, Math.max(-0.2, y), pos.getZ(i) + v.z * dt);
      });
      pos.needsUpdate = true;
      drops.material.opacity = Math.max(0, drops.material.opacity - dt * 0.35);
      if (drops.material.opacity <= 0) dropsOn = false;
    }
    camera.lookAt(LOOK);
    composer.render(dt);
    raf = requestAnimationFrame(frame);
  };
  const onVisible = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVisible);
  setSun(SUN_START);
  raf = requestAnimationFrame(frame);
  o.onPhase(phase);

  const api = {
    open() {
      if (phase !== "idle" && phase !== "arrive") return;
      camFrom.copy(camera.position);
      openT = now();
      setPhase("open");
    },
    skip() {
      if (phase !== "idle" && phase !== "arrive") return;
      camFrom.copy(camera.position);
      openT = now() - 6.0;
      setPhase("open");
    },
    replay() {
      scrollTo(0, 0);
      flags.pop = flags.rustle = flags.rustle2 = flags.drops = flags.stamp = false;
      cork.position.copy(corkStart);
      cork.rotation.set(0, 0, 0);
      dropsOn = false;
      orbit.a = orbit.v = 0;
      letterIntoBottle();
      t0 = now();
      setPhase("arrive");
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("deviceorientation", onTilt);
      document.removeEventListener("visibilitychange", onVisible);
      envRT?.dispose();
      pmrem.dispose();
      composer.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
    },
  };
  return api;
}

export type Stage = ReturnType<typeof createStage>;
