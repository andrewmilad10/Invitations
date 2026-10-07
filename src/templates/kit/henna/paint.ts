/**
 * Canvas painting for Henna Tent: the velvet curtains (each row gathered
 * towards the side so the folds bunch up like real fabric) and the dried
 * henna paste guests rub off the brass trays.
 */

const sm = (x: number) => x * x * (3 - 2 * x);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const TIE = 0.58;
export const OPEN_MS = 3600;

/** Inner edge of the gathered left curtain, as a fraction of the width, at height fraction y. */
function openEdge(y: number, wide: boolean) {
  const [top, mid, bot] = wide ? [0.22, 0.085, 0.15] : [0.27, 0.1, 0.19];
  return y < TIE ? top + (mid - top) * sm(y / TIE) : mid + (bot - mid) * sm((y - TIE) / (1 - TIE));
}

/** Draws both curtains `ms` after the guest tapped (0 = closed, ≥ OPEN_MS = gathered at the sides). */
export function drawCurtains(ctx: CanvasRenderingContext2D, W: number, H: number, left: HTMLImageElement, right: HTMLImageElement, ms: number) {
  ctx.clearRect(0, 0, W, H);
  const iw = left.naturalWidth, ih = left.naturalHeight;
  if (!iw || !W || !H) return;
  const s = H / ih, cw = W / 2 + 4, srcW = Math.min(iw, cw / s), step = 2, wide = W > 900;
  for (let y = 0; y < H; y += step) {
    const fy = y / H, delay = (0.24 * Math.abs(fy - 0.55)) / 0.55;
    const u = Math.max(0, Math.min(1, (ms / OPEN_MS - delay) / (1 - 0.24)));
    const e = cw + (openEdge(fy, wide) * W - cw) * eio(u);
    const sy = fy * ih;
    ctx.drawImage(left, iw - srcW, sy, srcW, step / s, 0, y, e, step + 0.5);
    ctx.drawImage(right, 0, sy, srcW, step / s, W - e, y, e, step + 0.5);
    const k = 1 - e / cw; // gathered velvet falls into shadow and casts one on the room
    if (k > 0) {
      ctx.fillStyle = `rgba(30,0,0,${k * 0.22})`;
      ctx.fillRect(0, y, e, step);
      ctx.fillRect(W - e, y, e, step);
      ctx.fillStyle = `rgba(60,10,0,${k * 0.16})`;
      ctx.fillRect(e, y, 10, step);
      ctx.fillRect(W - e - 10, y, 10, step);
      ctx.fillStyle = `rgba(60,10,0,${k * 0.08})`;
      ctx.fillRect(e + 10, y, 14, step);
      ctx.fillRect(W - e - 24, y, 14, step);
    }
  }
}

/** Dried, slightly cracked henna paste covering a tray (seeded, so every visit looks the same). */
export function paintPaste(c: HTMLCanvasElement, seed: number) {
  const g = c.getContext("2d");
  if (!g) return;
  let n = seed * 9301 + 49297;
  const rnd = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
  const r = c.width / 2;
  g.save();
  g.beginPath();
  g.arc(r, r, r * 0.97, 0, 7);
  g.clip();
  const gr = g.createRadialGradient(r * 0.7, r * 0.6, 0, r, r, r);
  gr.addColorStop(0, "rgb(91,74,34)");
  gr.addColorStop(1, "rgb(51,39,15)");
  g.fillStyle = gr;
  g.fillRect(0, 0, c.width, c.width);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = rnd() < 0.5 ? "rgba(120,100,50,.25)" : "rgba(15,10,0,.25)";
    g.beginPath();
    g.arc(rnd() * c.width, rnd() * c.width, rnd() * r * 0.035 + 0.5, 0, 7);
    g.fill();
  }
  g.strokeStyle = "rgba(160,140,90,.45)";
  g.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    let x = rnd() * c.width, y = rnd() * c.width;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += (rnd() - 0.5) * r * 0.35;
      y += (rnd() - 0.5) * r * 0.35;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}
