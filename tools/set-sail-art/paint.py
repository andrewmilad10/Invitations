"""Watercolour art for Set Sail, painted procedurally: the sea (hero), a caustics overlay and a chart of the islands."""
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_erosion, zoom
from scipy.spatial import cKDTree
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(7)
PAPER = np.asarray(Image.open("/home/claude/vellum/public/templates/cotton-press/paper.webp").convert("L"), dtype=float) / 255


def noise(h, w, scale, oct=4, sx=1.0):
    """Smooth fractal noise in 0..1; sx stretches it horizontally (brush strokes)."""
    out = np.zeros((h, w))
    amp, tot = 1.0, 0
    for o in range(oct):
        s = scale / (2 ** o)
        gh, gw = max(2, int(h / s) + 2), max(2, int(w / (s * sx)) + 2)
        g = rng.random((gh, gw))
        up = zoom(g, (h / gh * 1.02, w / gw * 1.02), order=3)[:h, :w]
        out += amp * up
        tot += amp
        amp *= .5
    out /= tot
    return (out - out.min()) / (out.max() - out.min())


def paper(h, w):
    t = np.tile(PAPER, (h // PAPER.shape[0] + 1, w // PAPER.shape[1] + 1))[:h, :w]
    return t / t.mean()


def lerp(a, b, t):
    return a + (b - a) * t[..., None]


def C(hexs):
    return np.array([int(hexs[i:i + 2], 16) for i in (1, 3, 5)], float)


def granulate(img, k=.06):
    g = rng.random(img.shape[:2])
    g = gaussian_filter(g, .8)
    return img * (1 - k + 2 * k * g)[..., None]


def save(a, name, q=86):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(name, "WEBP", quality=q, method=6)


def sea(W=1600, H=2000, horizon=.30):
    y = np.linspace(0, 1, H)[:, None] * np.ones((1, W))
    x = np.linspace(0, 1, W)[None, :] * np.ones((H, 1))
    img = np.ones((H, W, 3)) * C("#f7f4ec")
    # sky: a pale wash with soft cloud blooms
    sky = (y < horizon + .01)
    cl = noise(H, W, 420, 4, sx=2.2)
    skyCol = lerp(C("#f2f4ef"), C("#bcd7e2"), np.clip(np.clip(1 - y / horizon, 0, 1) * .7 + (cl - .5) * .9, 0, 1))
    img = np.where(sky[..., None], skyCol, img)
    # sea body: deep teal at the horizon to clear aqua near us
    t = np.clip((y - horizon) / (1 - horizon), 0, 1)
    body = lerp(C("#5f97b0"), C("#9fd2d8"), t ** .7)
    streak = noise(H, W, 160, 4, sx=6)
    body = lerp(body, C("#3f7f9c"), np.clip((streak - .55) * 1.6, 0, 1) * (1 - t) * .9)
    body = lerp(body, C("#c6ead9"), np.clip((noise(H, W, 300, 3) - .5) * 1.2, 0, 1) * t * .7)
    # caustics: cells growing towards us, light edges, slightly greener cells
    n = 220
    py = .25 + .75 * rng.random(n) ** .8
    pts = np.c_[rng.random(n) * W, (horizon + (1 - horizon) * py) * H]
    ys = np.clip((y - horizon) / (1 - horizon), 0, 1)
    tree = cKDTree(np.c_[pts[:, 0], pts[:, 1] * 1.0])
    gy, gx = np.mgrid[0:H, 0:W]
    warp = (noise(H, W, 90, 3) - .5) * 40
    q = np.c_[(gx + warp).ravel(), (gy + warp * .5).ravel()]
    d, idx = tree.query(q, k=2)
    edge = (d[:, 1] - d[:, 0]).reshape(H, W)
    scale = 4 + ys * 22
    line = np.exp(-(edge / scale) ** 2 * 3)
    line = gaussian_filter(line, 2.2) * np.clip((ys - .3) * 2.2, 0, 1) * (.55 + .45 * noise(H, W, 200, 3))
    cellTone = rng.random(n)[idx[:, 0]].reshape(H, W)
    tone = gaussian_filter(cellTone, 6)
    body = lerp(body, C("#86c7b4"), np.clip((tone - .55) * 2.5, 0, 1) * .45 * ys)
    body = lerp(body, C("#4f93b0"), np.clip((.4 - tone) * 2.5, 0, 1) * .35 * ys)
    body = lerp(body, C("#f4fbf8"), line * .7)
    # glints on the far water: short horizontal light dashes
    gl = noise(H, W, 18, 2, sx=7)
    body = lerp(body, C("#e9f4f4"), np.clip((gl - .78) * 5, 0, 1) * np.clip(1 - t * 2.2, 0, 1) * .8)
    # watercolour blooms with darker wet edges
    bl = noise(H, W, 260, 3)
    bm = (bl > .58).astype(float)
    bedge = gaussian_filter(bm, 7) * (1 - gaussian_filter(bm, 7)) * 4
    body = lerp(body, C("#3d7891"), np.clip(bedge, 0, 1) * .06)
    body = lerp(body, C("#bfe4e4"), gaussian_filter(bm, 12) * .08)
    # soft horizon line and wet edge
    seaMask = np.clip((y - horizon) * H / 6, 0, 1)
    img = img * (1 - seaMask[..., None]) + body * seaMask[..., None]
    hz = np.exp(-((y - horizon) * H / 9) ** 2)
    img = lerp(img, C("#5b8ea5"), hz * .45)
    img = gaussian_filter(img, (.8, .8, 0))
    img = granulate(img, .05) * paper(H, W)[..., None] ** .5
    save(img, "sea.webp", 82)


def chart(W=900, H=1100):
    y = np.linspace(0, 1, H)[:, None] * np.ones((1, W))
    img = np.ones((H, W, 3)) * C("#f6f1e6")
    # sea wash, uneven, fading at the paper edge (a painted vignette)
    wash = noise(H, W, 240, 4)
    edgefade = np.clip(1 - (np.abs(np.linspace(-1, 1, W))[None, :] ** 6 + np.abs(np.linspace(-1, 1, H))[:, None] ** 6), 0, 1)
    seaC = lerp(C("#cfe6e8"), C("#9ecbd6"), wash)
    img = lerp(img, seaC, edgefade * (.75 + wash * .25))
    # islands
    land = np.zeros((H, W))
    islands = [(.24, .15, 170, 80), (.62, .12, 90, 50), (.86, .27, 120, 66), (.3, .42, 80, 46), (.58, .4, 150, 92), (.82, .55, 90, 56),
               (.16, .64, 110, 60), (.48, .66, 84, 50), (.72, .78, 130, 76), (.3, .86, 96, 52), (.9, .88, 64, 40), (.1, .92, 54, 34), (.44, .24, 48, 30), (.92, .68, 46, 30)]
    gy, gx = np.mgrid[0:H, 0:W]
    shape = noise(H, W, 46, 5)
    for cx, cy, rx, ry in islands:
        a = rng.random() * 3.14
        dx, dy = gx - cx * W, gy - cy * H
        u = (dx * np.cos(a) + dy * np.sin(a)) / rx
        v = (-dx * np.sin(a) + dy * np.cos(a)) / ry
        land = np.maximum(land, 1 - np.sqrt(u * u + v * v) + (shape - .5) * 1.25)
    m = land > .35
    # shallow water ring
    ring = gaussian_filter(m.astype(float), 14)
    img = lerp(img, C("#bfe3dc"), np.clip(ring * 2.2, 0, 1) * (~m) * .9)
    # sand rim then green, with darker pigment at the edges
    sandM = m & ~binary_erosion(m, iterations=4)
    inner = binary_erosion(m, iterations=4)
    green = lerp(C("#a7c08a"), C("#7f9f6c"), noise(H, W, 40, 3))
    green = lerp(green, C("#c7b383"), np.clip((noise(H, W, 90, 3) - .5) * 2.2, 0, 1) * .8)
    green = lerp(green, C("#6d8f5e"), np.clip((noise(H, W, 26, 3) - .6) * 3, 0, 1) * .6)
    img = np.where(inner[..., None], green, img)
    img = np.where(sandM[..., None], lerp(C("#efe2c0"), C("#e2d0a4"), noise(H, W, 30, 2)), img)
    edge = m & ~binary_erosion(m, iterations=2)
    img = lerp(img, C("#6f8a62"), gaussian_filter(edge.astype(float), 1) * .55)
    ie = inner & ~binary_erosion(inner, iterations=3)
    img = lerp(img, C("#5f7d55"), gaussian_filter(ie.astype(float), 1.2) * .35)
    img = granulate(img, .06) * paper(H, W)[..., None] ** .6
    # soften the whole thing a touch, like wet paint
    img = gaussian_filter(img, (.7, .7, 0))
    save(img, "chart.webp", 86)


if __name__ == "__main__":
    import sys
    for k in sys.argv[1:] or ["sea", "chart"]:
        globals()[k]()
