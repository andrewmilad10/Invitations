// Paper-craft flowers: cut, cupped and curled paper petals, lit like a product photo.
import * as THREE from "three";
import { RoomEnvironment } from "./node_modules/three/examples/jsm/environments/RoomEnvironment.js";

let seed = 1;
export const srand = (n) => (seed = n >>> 0 || 1);
export const rnd = (a = 0, b = 1) => a + (b - a) * ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// ── Textures ──
function canvasTex(w, h, draw, srgb = false) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
// cotton paper fibres: grey noise + a few long fibres (used for bump + roughness + colour)
const paperTex = canvasTex(512, 512, (x, w, h) => {
  const id = x.createImageData(w, h);
  for (let i = 0; i < id.data.length; i += 4) { const v = 200 + Math.random() * 55; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0);
  x.globalAlpha = .18; x.strokeStyle = "#fff";
  for (let i = 0; i < 260; i++) { x.lineWidth = Math.random() * 1.2; x.beginPath(); const sx = Math.random() * w, sy = Math.random() * h; x.moveTo(sx, sy); x.quadraticCurveTo(sx + Math.random() * 40 - 20, sy + Math.random() * 40 - 20, sx + Math.random() * 60 - 30, sy + Math.random() * 60 - 30); x.stroke(); }
  x.filter = "blur(.6px)"; x.drawImage(x.canvas, 0, 0);
});
paperTex.wrapS = paperTex.wrapT = THREE.RepeatWrapping;

// petal silhouettes (white = paper), drawn in a unit square: base at bottom centre
const shapes = {
  round: (x, w, h) => { x.beginPath(); x.moveTo(w * .5, h); x.bezierCurveTo(w * .05, h * .75, -w * .02, h * .12, w * .5, h * .03); x.bezierCurveTo(w * 1.02, h * .12, w * .95, h * .75, w * .5, h); x.fill(); },
  heart: (x, w, h) => { x.beginPath(); x.moveTo(w * .5, h); x.bezierCurveTo(w * .02, h * .7, -w * .04, h * .05, w * .32, h * .04); x.quadraticCurveTo(w * .45, h * .04, w * .5, h * .12); x.quadraticCurveTo(w * .55, h * .04, w * .68, h * .04); x.bezierCurveTo(w * 1.04, h * .05, w * .98, h * .7, w * .5, h); x.fill(); },
  diamond: (x, w, h) => { x.beginPath(); x.moveTo(w * .5, h); x.quadraticCurveTo(w * .02, h * .45, w * .5, h * .02); x.quadraticCurveTo(w * .98, h * .45, w * .5, h); x.fill(); },
  leaf: (x, w, h) => { x.beginPath(); x.moveTo(w * .5, h); x.bezierCurveTo(w * .02, h * .7, w * .1, h * .2, w * .5, 0); x.bezierCurveTo(w * .9, h * .2, w * .98, h * .7, w * .5, h); x.fill(); },
  ruffle: (x, w, h) => { x.beginPath(); x.moveTo(w * .5, h); x.bezierCurveTo(w * .0, h * .75, w * .0, h * .2, w * .12, h * .1); for (let i = 0; i <= 8; i++) { const px = w * (.12 + i * .095), py = h * (.06 + (i % 2) * .05); x.quadraticCurveTo(px - w * .04, py - h * .05, px, py); } x.bezierCurveTo(w, h * .2, w, h * .75, w * .5, h); x.fill(); },
};
const alphaCache = {};
function alphaFor(kind) {
  if (alphaCache[kind]) return alphaCache[kind];
  return (alphaCache[kind] = canvasTex(256, 256, (x, w, h) => { x.fillStyle = "#000"; x.fillRect(0, 0, w, h); x.fillStyle = "#fff"; x.filter = "blur(1px)"; shapes[kind](x, w, h); }));
}
// colour map: deeper at the base, paler at the edge (like dyed/coloured paper catching light)
const colourCache = {};
function colourFor(kind, base, edge) {
  const key = kind + base + edge;
  if (colourCache[key]) return colourCache[key];
  return (colourCache[key] = canvasTex(256, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, base); g.addColorStop(1, edge);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (kind === "leaf") { x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 2; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 4); x.stroke(); }
  }, true));
}

const mats = {};
export function paperMat(kind, base, edge, o = {}) {
  const key = [kind, base, edge, o.rough].join();
  if (mats[key]) return mats[key];
  const m = new THREE.MeshStandardMaterial({ map: colourFor(kind, base, edge), alphaMap: alphaFor(kind), alphaTest: .5, side: THREE.DoubleSide, roughness: o.rough ?? .92, metalness: 0, bumpMap: paperTex, bumpScale: o.bump ?? 1.2, envMapIntensity: .35 });
  m.userData.depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: m.alphaMap, alphaTest: .5, side: THREE.DoubleSide });
  return (mats[key] = m);
}

// A petal: plane bent into a cup, curved along its length, curled at the tip, softly ruffled.
function petalGeo(w, l, o = {}) {
  const g = new THREE.PlaneGeometry(w, l, 16, 20);
  g.translate(0, l / 2, 0);
  const p = g.attributes.position;
  const ph = rnd(0, 6.28);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const u = x / w, v = y / l;
    let z = (o.cup ?? .5) * w * u * u * 2;               // cupped across
    z += (o.arc ?? .15) * l * v * v;                       // curves up along its length
    const tip = Math.max(0, (v - (o.curlFrom ?? .65)) / (1 - (o.curlFrom ?? .65)));
    z -= (o.curl ?? .25) * l * tip * tip;                  // tip rolls back
    z += (o.ruffle ?? .03) * l * Math.sin(u * 14 + ph) * v * v;
    p.setZ(i, z);
  }
  g.computeVertexNormals();
  return g;
}
export function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  if (mat.userData.depth) m.customDepthMaterial = mat.userData.depth;
  return m;
}

// ── Flowers (each returns a Group with its axis along +z, size ~ r) ──
export function rose(r, base = "#e9a9b0", edge = "#fbe3e3", o = {}) {
  const g = new THREE.Group();
  const n = o.petals ?? 26;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const phi = i * 2.39996 + rnd(-.15, .15);
    const size = r * (.32 + .7 * t ** .8);
    const tilt = THREE.MathUtils.lerp(1.35, o.open ?? .32, t ** .9) + rnd(-.08, .08);
    const geo = petalGeo(size * (.95 + .2 * t), size, { cup: THREE.MathUtils.lerp(.95, .45, t), arc: .1, curl: THREE.MathUtils.lerp(.05, .32, t), curlFrom: .6, ruffle: .025 });
    const m = mesh(geo, paperMat(t < .35 ? "round" : (o.shape ?? "heart"), base, edge));
    const holder = new THREE.Group();
    m.rotation.x = tilt; m.position.y = r * .05 * t;
    holder.add(m); holder.rotation.z = phi; holder.position.z = -t * r * .08;
    g.add(holder);
  }
  return g;
}
export function hydrangea(r, palette, o = {}) {
  const g = new THREE.Group();
  const n = o.florets ?? 46;
  for (let i = 0; i < n; i++) {
    // points on a dome (golden spiral)
    const t = (i + .5) / n, inc = Math.acos(1 - t * (1 - Math.cos(1.25))), az = i * 2.39996;
    const dir = new THREE.Vector3(Math.sin(inc) * Math.cos(az), Math.sin(inc) * Math.sin(az), Math.cos(inc));
    const f = new THREE.Group();
    const [base, edge] = palette[Math.floor(rnd(0, palette.length))];
    const s = r * rnd(.24, .3);
    const rot = rnd(0, 1.6);
    for (let k = 0; k < 4; k++) {
      const m = mesh(petalGeo(s * .95, s, { cup: .35, arc: .05, curl: .12, curlFrom: .55, ruffle: .02 }), paperMat("diamond", base, edge));
      const h = new THREE.Group(); m.rotation.x = .28 + rnd(-.1, .1); h.add(m); h.rotation.z = rot + k * Math.PI / 2; f.add(h);
    }
    const c = new THREE.Mesh(new THREE.SphereGeometry(s * .07, 10, 8), new THREE.MeshStandardMaterial({ color: "#efe6d6", roughness: .5 }));
    c.castShadow = true; c.position.z = s * .04; f.add(c);
    f.position.copy(dir.clone().multiplyScalar(r * .78)); f.position.z -= r * .55;
    f.lookAt(f.position.clone().add(dir));
    f.rotateZ(rnd(0, 3));
    g.add(f);
  }
  return g;
}
export function blossom(r, base = "#f4efe9", edge = "#ffffff", o = {}) {
  const g = new THREE.Group(); const n = o.petals ?? 5;
  for (let k = 0; k < n; k++) {
    const m = mesh(petalGeo(r * .85, r, { cup: .4, arc: .08, curl: .1, ruffle: .02 }), paperMat("round", base, edge));
    const h = new THREE.Group(); m.rotation.x = .22; h.add(m); h.rotation.z = (k / n) * Math.PI * 2 + rnd(-.1, .1); g.add(h);
  }
  g.add(pearl(r * .22, o.centre));
  return g;
}
export function leaf(len, base = "#8fa58a", edge = "#c7d4bd", o = {}) {
  const geo = new THREE.PlaneGeometry(len * (o.ratio ?? .42), len, 12, 20); geo.translate(0, len / 2, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), v = y / len; p.setZ(i, Math.abs(x) * (o.fold ?? .55) + (o.arc ?? .12) * len * Math.sin(v * Math.PI) - .1 * len * v * v); }
  geo.computeVertexNormals();
  return mesh(geo, paperMat(o.shape ?? "leaf", base, edge, { bump: .4 }));
}
const pearlMat = new THREE.MeshPhysicalMaterial({ color: "#f6efe9", roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .15, iridescence: .6, iridescenceIOR: 1.6, sheen: .4, sheenColor: new THREE.Color("#ffe9f0"), envMapIntensity: 1.2 });
export function pearl(r, colour) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), colour ? pearlMat.clone().setValues({ color: colour }) : pearlMat);
  m.castShadow = true; m.position.z = r * .6;
  return m;
}
// a sprig: paper-wrapped stem with leaves along it
export function sprig(len, ang, o = {}) {
  const g = new THREE.Group();
  const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6, a = ang + (o.bend ?? .3) * t; pts.push(new THREE.Vector3(Math.cos(a) * len * t, Math.sin(a) * len * t, len * .02 * Math.sin(t * Math.PI))); }
  const curve = new THREE.CatmullRomCurve3(pts);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, len * .007, 8), new THREE.MeshStandardMaterial({ color: o.stem ?? "#9aa88c", roughness: .9 }));
  stem.castShadow = true; g.add(stem);
  const nLeaves = o.leaves ?? 9;
  for (let i = 1; i <= nLeaves; i++) {
    const t = i / (nLeaves + .5); const pt = curve.getPoint(t); const tan = curve.getTangent(t);
    const a = Math.atan2(tan.y, tan.x);
    for (const side of i === nLeaves ? [0] : [-1, 1]) {
      const l = leaf(len * (o.leaf ?? .22) * (1.1 - t * .5), o.colour, o.edge, { fold: o.round ? .15 : .5, ratio: o.round ? .85 : .42, shape: o.round ? "round" : "leaf" });
      l.rotation.x = .25;
      const h = new THREE.Group(); h.add(l); h.position.copy(pt); h.rotation.z = a - Math.PI / 2 + side * (o.spread ?? .9) * (side ? 1 : 0); g.add(h);
    }
  }
  return g;
}

// ── Stage ──
export function stage(w, h, o = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(w, h);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = o.exposure ?? .9;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = o.env ?? 1;
  const dist = (h / 2) / Math.tan(THREE.MathUtils.degToRad((o.fov ?? 18) / 2));
  const cam = new THREE.PerspectiveCamera(o.fov ?? 18, w / h, 10, dist * 2);
  cam.position.set(0, 0, dist); cam.lookAt(0, 0, 0);
  const hemi = new THREE.HemisphereLight("#ffffff", "#d9c9bd", o.hemi ?? .45); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff5ea", o.sun ?? 3.1);
  sun.position.set(-w * .55, h * .65, Math.max(w, h) * .75); sun.castShadow = true;
  const S = Math.max(w, h) * .65; Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 10, far: Math.max(w, h) * 3 });
  sun.shadow.mapSize.set(o.map ?? 1024, o.map ?? 1024); sun.shadow.radius = o.soft ?? 6; sun.shadow.blurSamples = 8; sun.shadow.bias = -0.0004;
  scene.add(sun);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(w * 3, h * 3), new THREE.ShadowMaterial({ opacity: o.shadow ?? .2 }));
  catcher.receiveShadow = true; catcher.position.z = -2; scene.add(catcher);
  // flat coordinate helper: pixels from the canvas centre, y up
  const put = (obj, x, y, z = 0, rz = 0, s = 1) => { obj.position.set(x, y, z); obj.rotation.z += rz; if (s !== 1) obj.scale.multiplyScalar(s); scene.add(obj); return obj; };
  // blind emboss: everything white paper, pressed flat into a paper sheet
  const emboss = (paperColour = "#fbf9f6", depth = .4, o2 = {}) => {
    hemi.intensity = o2.hemi ?? .7; scene.environmentIntensity = .3; renderer.toneMappingExposure = o2.exposure ?? .97;
    catcher.visible = false;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w * 3, h * 3), new THREE.MeshStandardMaterial({ color: paperColour, roughness: .95, bumpMap: paperTex, bumpScale: .5 }));
    sheet.receiveShadow = true; sheet.position.z = -1; scene.add(sheet); if (o2.bump) sheet.material.bumpScale = o2.bump;
    paperTex.repeat.set(1, 1);
    scene.traverse((o) => { if (o.isMesh && o !== sheet && o !== catcher) { const m = o.material.clone(); m.map = null; m.color = new THREE.Color(paperColour); if ("clearcoat" in m) { m.clearcoat = 0; m.iridescence = 0; m.roughness = .9; } o.material = m; } });
    scene.children.forEach((o) => { if (o.isGroup || (o.isMesh && o !== sheet && o !== catcher)) o.scale.z *= depth; });
    sun.position.set(-w * .8, h * .9, Math.max(w, h) * .7);
    sun.intensity = o2.sun ?? 3.3; sun.shadow.radius = o2.soft ?? 5;
  };
  // foil: everything turns to polished metal of one colour
  const metal = (colour, rough = .3) => {
    catcher.visible = true;
    scene.traverse((o) => { if (o.isMesh && o !== catcher) { const old = o.material; const m = new THREE.MeshStandardMaterial({ color: colour, metalness: 1, roughness: rough, alphaMap: old.alphaMap ?? null, alphaTest: old.alphaTest ?? 0, side: THREE.DoubleSide, bumpMap: paperTex, bumpScale: .15, envMapIntensity: 1.5 }); o.material = m; } });
    scene.environmentIntensity = 1.2; renderer.toneMappingExposure = 1.05; hemi.intensity = .3; sun.intensity = 2.2;
  };
  const render = () => { renderer.render(scene, cam); return renderer.domElement.toDataURL("image/png"); };
  return { scene, put, render, emboss, metal, sun, hemi, renderer, THREE };
}
