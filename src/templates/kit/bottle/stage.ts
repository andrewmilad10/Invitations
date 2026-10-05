/**
 * Message in a Bottle — the live 3D scene (three.js), loaded only in the
 * browser for live and sample invitations. A real-time ocean under a painted
 * sky; a glass bottle drifts in on the swell. open(): the camera closes in,
 * the bottle lifts dripping from the water, the cork twists and pops, the
 * letter slides out of the neck, turns to the guest and unrolls (the roll is
 * a vertex shader on a plane). Then the letter rides up with the page and
 * the sun sets as the guest scrolls, with stars by the end.
 */
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";

export type StagePhase = "arrive" | "idle" | "open" | "read";
export interface StageText { eyebrow: string; lead: string; one: string; two: string; amp: string; date: string; place: string }
export interface StageFonts { script: string; serif: string; caps: string }
export interface StageOptions {
  text: StageText;
  fonts: StageFonts;
  reduced: boolean;
  onPhase: (p: StagePhase) => void;
  onTap: (x: number, y: number) => void;
  sound: { pop: () => void; rustle: (len: number) => void };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};

const PW = 1.6, PH = 2.4, LETTER_Y = 1.75;
const KEYS: [number, string, string, string, string][] = [
  // sun elevation, zenith, mid sky, horizon, glow
  [16, "#4a8ccb", "#9bc6e6", "#e4eef0", "#fff4dc"],
  [6, "#4f80b8", "#a3bfd8", "#f3dcc2", "#ffd9a4"],
  [1, "#3d5684", "#a58aa5", "#f6b48a", "#ffb067"],
  [-2.4, "#0a1430", "#22284a", "#4c3a58", "#a2604f"],
];

function waterNormals(N = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const x = c.getContext("2d")!;
  const id = x.createImageData(N, N);
  const waves: number[][] = [];
  for (let i = 0; i < 28; i++) {
    const f = 2 + i * 1.3, a = Math.random() * 6.28;
    waves.push([Math.round(Math.cos(a) * f), Math.round(Math.sin(a) * f), Math.random() * 6.28, 1 / (1 + i * 0.45)]);
  }
  const h = (u: number, v: number) => waves.reduce((s, [a, b, p, amp]) => s + amp * Math.sin(6.2832 * (a * u + b * v) + p), 0);
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
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

async function letterTexture(text: StageText, fonts: StageFonts, aniso: number) {
  await Promise.all([document.fonts.load(`400 120px ${fonts.script}`), document.fonts.load(`500 60px ${fonts.serif}`), document.fonts.load(`400 30px ${fonts.caps}`)]).catch(() => undefined);
  const W = 1024, H = 1536, c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  x.fillStyle = "#f3e6c6";
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 300; i++) {
    const r = 30 + Math.random() * 160, g = x.createRadialGradient(0, 0, 0, 0, 0, r);
    const col = Math.random() < 0.4 ? "170,125,60" : "255,246,226";
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
  x.globalAlpha = 0.1;
  x.strokeStyle = "#6e4f25";
  for (let i = 0; i < 700; i++) {
    x.lineWidth = 0.4 + Math.random();
    x.beginPath();
    const a = Math.random() * W, b = Math.random() * H;
    x.moveTo(a, b);
    x.lineTo(a + Math.random() * 50 - 25, b + Math.random() * 8 - 4);
    x.stroke();
  }
  x.globalAlpha = 1;
  const vg = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  vg.addColorStop(0, "rgba(120,80,30,0)");
  vg.addColorStop(1, "rgba(130,85,30,.32)");
  x.fillStyle = vg;
  x.fillRect(0, 0, W, H);
  // the words
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
  x.fillStyle = "#7b6440";
  fit(text.eyebrow.toUpperCase(), W * 0.8, 30, (s) => `400 ${s}px ${fonts.caps}`);
  x.fillText(text.eyebrow.toUpperCase(), W / 2, 330);
  x.fillStyle = "#2c3a44";
  fit(text.lead, W * 0.84, 76, (s) => `500 ${s}px ${fonts.serif}`);
  x.fillText(text.lead, W / 2, 440);
  x.fillStyle = "#1f3345";
  const fs = Math.min(fit(text.one, W * 0.8, 150, (s) => `400 ${s}px ${fonts.script}`), fit(text.two, W * 0.8, 150, (s) => `400 ${s}px ${fonts.script}`));
  x.font = `400 ${fs}px ${fonts.script}`;
  x.fillText(text.one, W / 2, 640);
  x.font = `400 ${fs * 0.6}px ${fonts.script}`;
  x.fillText(text.amp, W / 2, 740);
  x.font = `400 ${fs}px ${fonts.script}`;
  x.fillText(text.two, W / 2, 880);
  x.strokeStyle = "#8a6f45";
  x.globalAlpha = 0.7;
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(W / 2 - 170, 990);
  x.lineTo(W / 2 - 40, 990);
  x.moveTo(W / 2 + 40, 990);
  x.lineTo(W / 2 + 170, 990);
  x.stroke();
  x.globalAlpha = 1;
  x.save();
  x.translate(W / 2, 990);
  x.lineWidth = 3;
  x.lineCap = "round";
  x.beginPath();
  x.arc(0, -20, 6, 0, 7);
  x.moveTo(0, -14);
  x.lineTo(0, 22);
  x.moveTo(-10, -6);
  x.lineTo(10, -6);
  x.moveTo(-18, 8);
  x.quadraticCurveTo(-14, 24, 0, 24);
  x.quadraticCurveTo(14, 24, 18, 8);
  x.stroke();
  x.restore();
  x.fillStyle = "#3b3427";
  for (const [line, y] of [[text.date, 1120], [text.place, 1190]] as [string, number][]) {
    if (!line) continue;
    fit(line, W * 0.84, 54, (s) => `500 ${s}px ${fonts.serif}`);
    x.fillText(line, W / 2, y);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}

function deckle() {
  const W = 256, H = 384, c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000";
  x.fillRect(0, 0, W, H);
  x.fillStyle = "#fff";
  x.beginPath();
  const j = () => (Math.random() - 0.5) * 3.2, m = 5;
  for (let i = 0; i <= W; i += 4) x.lineTo(i, m + j());
  for (let i = 0; i <= H; i += 4) x.lineTo(W - m + j(), i);
  for (let i = W; i >= 0; i -= 4) x.lineTo(i, H - m + j());
  for (let i = H; i >= 0; i -= 4) x.lineTo(m + j(), i);
  x.fill();
  return new THREE.CanvasTexture(c);
}

function corkTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  x.fillStyle = "#c49a63";
  x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 700; i++) {
    x.fillStyle = Math.random() < 0.5 ? `rgba(110,72,35,${0.2 + Math.random() * 0.4})` : `rgba(235,200,150,${0.2 + Math.random() * 0.3})`;
    x.beginPath();
    x.ellipse(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2.5, 1 + Math.random() * 2, Math.random() * 3, 0, 7);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createStage(canvas: HTMLCanvasElement, o: StageOptions) {
  const mobile = matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.6 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20000);

  // the painted sky
  const skyU = { uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 0.2, -1) }, uGlow: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(9000, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
      uniforms: skyU,
      vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }",
      fragmentShader: `varying vec3 vDir; uniform vec3 uTop, uMid, uHor, uSun, uGlow;
        void main(){ float h = max(vDir.y, 0.); vec3 c = mix(uHor, uMid, smoothstep(0., .18, h)); c = mix(c, uTop, smoothstep(.15, .7, h));
          float d = max(dot(normalize(vDir), normalize(uSun)), 0.);
          c += uGlow * (pow(d, 6.) * .45 + pow(d, 60.) * .6) * (1. - smoothstep(.0, .5, h) * .5);
          c += vec3(1., .96, .88) * smoothstep(.99982, .99992, d);
          if (vDir.y < 0.) c = mix(uHor, uHor * .7, smoothstep(0., -.2, vDir.y));
          gl_FragColor = vec4(c, 1.); }`,
    }),
  );
  scene.add(sky);
  const ca = new THREE.Color(), cb = new THREE.Color();
  const grade = (elev: number) => {
    let i = 0;
    while (i < KEYS.length - 2 && elev < KEYS[i + 1][0]) i++;
    const [e0, ...A] = KEYS[i], [e1, ...B] = KEYS[i + 1];
    const k = clamp((e0 - elev) / (e0 - e1));
    [skyU.uTop, skyU.uMid, skyU.uHor, skyU.uGlow].forEach((u, j) => u.value.copy(ca.set(A[j])).lerp(cb.set(B[j]), k).convertSRGBToLinear());
  };

  // the sea
  const water = new Water(new THREE.PlaneGeometry(10000, 10000), { textureWidth: mobile ? 256 : 512, textureHeight: mobile ? 256 : 512, waterNormals: waterNormals(), sunDirection: new THREE.Vector3(), sunColor: 0xfff2d6, waterColor: 0x0b5a70, distortionScale: 3.4, fog: false });
  water.material.fragmentShader = water.material.fragmentShader.replace("float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );", "float reflectance = (rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 )) * 0.62;");
  water.rotation.x = -Math.PI / 2;
  const wu = water.material.uniforms;
  wu.size.value = 1.4;
  scene.add(water);

  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT: THREE.WebGLRenderTarget | null = null;
  const skyScene = new THREE.Scene();
  const sunLight = new THREE.DirectionalLight(0xfff0dd, 2.4);
  scene.add(sunLight);
  const hemi = new THREE.HemisphereLight(0xfff3e2, 0x5a7f88, 0.7);
  scene.add(hemi);
  const sun = new THREE.Vector3();
  let lastElev = 999;
  const setSun = (elev: number) => {
    sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elev), THREE.MathUtils.degToRad(205));
    skyU.uSun.value.copy(sun);
    grade(elev);
    wu.sunDirection.value.copy(sun).normalize();
    sunLight.position.copy(sun).multiplyScalar(50);
    const warm = clamp(1 - elev / 14);
    sunLight.color.setHSL(0.09 - warm * 0.04, 0.6 + warm * 0.3, 0.62 - warm * 0.1);
    sunLight.intensity = 2.6 * clamp((elev + 2) / 8, 0.15, 1);
    hemi.intensity = 0.25 + 0.55 * clamp((elev + 3) / 12);
    wu.sunColor.value.setHSL(0.1 - warm * 0.05, 0.7, 0.82 - warm * 0.15);
    renderer.toneMappingExposure = 0.75 + 0.25 * clamp((elev + 3) / 12);
    if (Math.abs(elev - lastElev) > 0.6) {
      lastElev = elev;
      skyScene.add(sky);
      envRT?.dispose();
      envRT = pmrem.fromScene(skyScene);
      scene.add(sky);
      scene.environment = envRT.texture;
    }
  };
  setSun(16);

  // stars for the dusk
  const sp: number[] = [];
  for (let i = 0; i < 900; i++) {
    const v = new THREE.Vector3().setFromSphericalCoords(8000, Math.acos(Math.random() * 0.9), Math.random() * 6.28);
    if (v.y > 200) sp.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(stars);

  // the letter: a plane that a vertex shader rolls up from the bottom edge
  const rollU = { uF: { value: PH / 2 }, uR0: { value: 0.045 }, uG: { value: 0.006 }, uH: { value: PH } };
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.85, toneMapped: false, side: THREE.DoubleSide, alphaMap: deckle(), alphaTest: 0.5, envMapIntensity: 0.15 });
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
      `vec4 sampledDiffuseColor = texture2D( map, vMapUv );
      if (!gl_FrontFacing) sampledDiffuseColor.rgb = texture2D( map, vec2(.06, vMapUv.y) ).rgb * vec3(.97,.94,.88);
      diffuseColor *= sampledDiffuseColor;`,
    );
  };
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH, 1, 220), paperMat);
  const paperRig = new THREE.Group();
  paperRig.add(paper);
  let disposed = false;
  letterTexture(o.text, o.fonts, renderer.capabilities.getMaxAnisotropy()).then((t) => {
    if (disposed) return t.dispose();
    paperMat.map = t;
    paperMat.emissiveMap = t;
    paperMat.needsUpdate = true;
  });

  // the bottle
  const bottle = new THREE.Group();
  const prof = [[0, -150], [44, -150], [50, -146], [52, -136], [52, 30], [50, 52], [40, 74], [24, 92], [17, 104], [16, 160], [19, 164], [20, 172], [17, 178]].map(([r, y]) => new THREE.Vector2(r * 0.0062, y * 0.0062));
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xf2fffb, transmission: 1, thickness: 0.22, roughness: 0.03, ior: 1.5, metalness: 0, attenuationColor: new THREE.Color(0xbfeee2), attenuationDistance: 3.5, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, specularIntensity: 1 });
  const glassMesh = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), glass);
  bottle.add(glassMesh);
  const corkTex = corkTexture();
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.1, 0.3, 32), new THREE.MeshStandardMaterial({ map: corkTex, roughness: 0.9, bumpMap: corkTex, bumpScale: 2 }));
  const corkStart = new THREE.Vector3(0, 178 * 0.0062 + 0.05, 0);
  cork.position.copy(corkStart);
  bottle.add(cork);
  const inside = new THREE.Group();
  inside.rotation.z = Math.PI / 2;
  bottle.add(inside);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 8, 40), new THREE.MeshStandardMaterial({ color: 0xa47e4e, roughness: 0.95 }));
  tie.rotation.y = Math.PI / 2;
  scene.add(bottle);

  // droplets as the bottle leaves the water
  const dropV = Array.from({ length: 70 }, () => new THREE.Vector3());
  const drops = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xe8fbff, size: 0.035, transparent: true, opacity: 0.9, depthWrite: false }));
  drops.geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Array(dropV.length * 3).fill(-10), 3));
  scene.add(drops);
  let dropsOn = false;
  const spawnDrops = () => {
    const pos = drops.geometry.attributes.position as THREE.BufferAttribute, w = new THREE.Vector3();
    dropV.forEach((v, i) => {
      glassMesh.localToWorld(w.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.5));
      pos.setXYZ(i, w.x, w.y - 0.1, w.z);
      v.set((Math.random() - 0.5) * 0.3, -Math.random() * 0.4, (Math.random() - 0.5) * 0.3);
    });
    pos.needsUpdate = true;
    dropsOn = true;
    drops.material.opacity = 0.9;
  };

  // ── layout ──
  let vw = 1, vh = 1, finalDist = 4;
  const resize = () => {
    vw = innerWidth;
    vh = innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.fov = camera.aspect < 0.8 ? 58 : 46;
    camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    finalDist = Math.max(PH / 0.8 / (2 * t), PW / 0.78 / (2 * t * camera.aspect));
  };
  addEventListener("resize", resize);
  resize();

  // ── the story ──
  const now = () => performance.now() / 1000;
  let phase: StagePhase = "arrive", t0 = now(), openT = 0, detached = false;
  const flags = { pop: false, rustle: false, rustle2: false, drops: false };
  const LOOK = new THREE.Vector3(0, 0.25, 0);
  const START = new THREE.Vector3(0, 1.6, 4.6);
  const CLOSE_CAM = new THREE.Vector3(0.25, 1.35, 3.9), CLOSE_LOOK = new THREE.Vector3(0, 1.15, 0.4);
  const camFrom = new THREE.Vector3(), bottleRest = new THREE.Vector3(0, 0.1, 0);
  const from = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 0.48 };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / vw) * 2 - 1;
    pointer.y = (e.clientY / vh) * 2 - 1;
  };
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    pointer.x = clamp(e.gamma / 25, -1, 1);
    pointer.y = clamp((e.beta - 45) / 30, -1, 1);
  };
  addEventListener("pointermove", onMove);
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

  const target = new THREE.Vector3(), ident = new THREE.Quaternion(), tmp = new THREE.Vector3();
  const stepOpen = (t: number, dt: number) => {
    const a = ease.inOut(seg(t, 0, 1.4));
    bottle.position.lerpVectors(bottleRest, tmp.set(-0.1, 1.05, 0.4), a);
    bottle.rotation.set(lerp(0.12, 0.3, a), lerp(0.5, -0.35, a), lerp(-Math.PI / 2 + 0.22, -0.62, a));
    camera.position.lerpVectors(camFrom, CLOSE_CAM, a);
    LOOK.lerpVectors(tmp.set(0, 0.25, 0), CLOSE_LOOK, a);
    if (t > 0.35 && !flags.drops) {
      flags.drops = true;
      spawnDrops();
    }
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
    // the bottle sinks back into the sea
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
    // and it unrolls
    const u = ease.inOut(seg(t, 4.3, 6.0));
    if (u > 0 && !flags.rustle2) {
      flags.rustle2 = true;
      o.sound.rustle(1.4);
    }
    rollU.uF.value = lerp(PH / 2, -PH / 2 - 0.02, u);
    paper.position.y = -(PH / 2 + rollU.uF.value) / 2;
    if (t > 6.1) setPhase("read");
  };

  // ── loop ──
  let last = now(), raf = 0;
  const tapPos = new THREE.Vector3();
  const frame = () => {
    const t = now(), dt = Math.min(0.05, t - last);
    last = t;
    wu.time.value += dt * 0.55;
    pointer.sx = lerp(pointer.sx, pointer.x, 0.04);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.04);
    const swell = Math.sin(t * 1.1) * 0.045 + Math.sin(t * 0.63 + 1) * 0.03;
    let progress = 0;
    if (phase === "arrive" || phase === "idle") {
      const k = o.reduced ? 1 : ease.out(seg(t - t0, 0, 5));
      bottle.position.set(lerp(2.6, 0, k), 0.1 + swell, lerp(-16, 0, k));
      bottle.rotation.set(0.12 + Math.sin(t * 0.9) * 0.05, 0.5 + Math.sin(t * 0.4) * 0.1, -Math.PI / 2 + 0.22 + Math.sin(t * 1.1 + 0.5) * 0.06);
      bottleRest.copy(bottle.position);
      camera.position.set(START.x + pointer.sx * 0.35, START.y - pointer.sy * 0.15 + Math.sin(t * 0.7) * 0.02, START.z);
      LOOK.set(bottle.position.x * 0.4, 0.25, bottle.position.z * 0.3);
      if (phase === "arrive" && k > 0.82) setPhase("idle");
      tapPos.copy(bottle.position).setY(bottle.position.y + 0.1).project(camera);
      o.onTap((tapPos.x * 0.5 + 0.5) * vw, (-tapPos.y * 0.5 + 0.5) * vh);
    } else if (phase === "open") {
      stepOpen(o.reduced ? 99 : t - openT, dt);
    } else {
      // the letter is fixed to the page and scrolls up with it; the sun sets as the guest reads
      const perPx = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * finalDist) / vh;
      paperRig.position.y = LETTER_Y + scrollY * perPx;
      paperRig.rotation.x = -clamp(scrollY / vh) * 0.35;
      camera.position.set(pointer.sx * 0.12, LETTER_Y - 0.1 - pointer.sy * 0.05, finalDist);
      LOOK.set(0, LETTER_Y + clamp(scrollY / vh) * 0.9, 0);
      progress = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - vh));
    }
    setSun(lerp(16, -2.4, ease.sine(progress)));
    stars.material.opacity = clamp((progress - 0.62) * 3.2) * 0.85;
    if (dropsOn) {
      const pos = drops.geometry.attributes.position as THREE.BufferAttribute;
      dropV.forEach((v, i) => {
        v.y -= 9.8 * dt * 0.5;
        pos.setXYZ(i, pos.getX(i) + v.x * dt, Math.max(-0.05, pos.getY(i) + v.y * dt), pos.getZ(i) + v.z * dt);
      });
      pos.needsUpdate = true;
      drops.material.opacity = Math.max(0, drops.material.opacity - dt * 0.4);
    }
    camera.lookAt(LOOK);
    renderer.render(scene, camera);
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
  raf = requestAnimationFrame(frame);
  o.onPhase(phase);

  return {
    open() {
      if (phase !== "idle" && phase !== "arrive") return;
      camFrom.copy(camera.position);
      openT = now();
      setPhase("open");
    },
    skip() {
      if (phase !== "idle" && phase !== "arrive") return;
      camFrom.copy(camera.position);
      openT = now() - 5.4;
      setPhase("open");
    },
    replay() {
      scrollTo(0, 0);
      flags.pop = flags.rustle = flags.rustle2 = flags.drops = false;
      cork.position.copy(corkStart);
      cork.rotation.set(0, 0, 0);
      dropsOn = false;
      letterIntoBottle();
      t0 = now();
      setPhase("arrive");
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("deviceorientation", onTilt);
      document.removeEventListener("visibilitychange", onVisible);
      envRT?.dispose();
      pmrem.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
    },
  };
}

export type Stage = ReturnType<typeof createStage>;
