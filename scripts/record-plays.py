#!/usr/bin/env python3
"""Record each website design for the marketing pages (see src/features/marketing/play/play-data.ts).

Needs a running build on :3100 (`npm run build && PORT=3100 npm start`), Playwright for Python and ffmpeg.
  python3 scripts/record-plays.py olive-courtyard blush-lace ...
Writes public/marketing/play/<id>-page.webp and <id>-first.webp (the first screen), and <id>-open.mp4 when the design has an opening.
Sample photos come from public/samples (the library host is swapped out), so no network is needed.
"""
import asyncio, sys, time, json, os, subprocess
from playwright.async_api import async_playwright
from PIL import Image
import tempfile
R=os.environ.get("RECORD_TMP", tempfile.gettempdir()+"/vellum-plays")
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,"public/marketing/play")
S=os.path.join(ROOT,"public/samples")+"/"
pics=[open(S+f,"rb").read() for f in ["hero.jpg","gallery-1.jpg","gallery-2.jpg","gallery-3.jpg","gallery-4.jpg","gallery-5.jpg"]]
res={}
async def img(route):
    u=route.request.url; k=sum(map(ord,u.split("?")[0]))%len(pics)
    await route.fulfill(status=200,content_type="image/jpeg",body=pics[k])
async def tap(pg):
    btn=pg.locator('[data-phase="closed"] button:visible').first
    if await btn.count():
        bb=await btn.bounding_box(); await pg.mouse.click(bb["x"]+bb["width"]/2, bb["y"]+bb["height"]/2)
    else: await pg.mouse.click(195,520)
async def one(b,id):
    d=f"{R}/pv/{id}"; os.makedirs(d,exist_ok=True)
    for f in os.listdir(d): os.remove(f"{d}/{f}")
    ctx=await b.new_context(viewport={"width":390,"height":844},record_video_dir=d,record_video_size={"width":390,"height":844})
    await ctx.route("**/images.unsplash.com/**",img)
    t0=time.monotonic(); pg=await ctx.new_page()
    await pg.goto(f"http://localhost:3100/embed/{id}",wait_until="networkidle"); await pg.wait_for_timeout(2600)
    has=await pg.evaluate("!!document.querySelector('[data-phase=\"closed\"]')")
    tc=time.monotonic()-t0
    await tap(pg)
    te=None
    for i in range(160):
        await pg.wait_for_timeout(100)
        left=await pg.evaluate("[...document.querySelectorAll('[data-phase]')].filter(e=>e.dataset.phase!=='done' && getComputedStyle(e).display!=='none' && getComputedStyle(e).visibility!=='hidden').length")
        if left==0: te=time.monotonic()-t0; break
    if te is None: te=time.monotonic()-t0
    await pg.wait_for_timeout(2200)
    # full page after opening, sections revealed by scrolling through
    await pg.add_style_tag(content="iframe{background:#e9e2d6}")
    h=await pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0,h,600):
        await pg.evaluate(f"scrollTo(0,{y})"); await pg.wait_for_timeout(240)
    await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(1500)
    await pg.screenshot(path=f"{d}/page.png",full_page=True)
    await ctx.close()
    vf=[f for f in os.listdir(d) if f.endswith(".webm")][0]
    im=Image.open(f"{d}/page.png").convert("RGB"); w,hh=im.size; im=im.crop((0,0,w,min(hh,7400)))
    im.save(f"{OUT}/{id}-page.webp",quality=68,method=6)
    if has:
        ss=max(0,tc-0.35); to=te+1.8
        subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",f"{ss:.2f}","-to",f"{to:.2f}","-i",f"{d}/{vf}","-an","-vf","scale=390:844,fps=30","-c:v","libx264","-preset","slow","-crf","27","-pix_fmt","yuv420p","-movflags","+faststart",f"{OUT}/{id}-open.mp4"],check=True)
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",f"{OUT}/{id}-open.mp4","-frames:v","1","-q:v","4",f"{d}/first.jpg"],check=True)
        Image.open(f"{d}/first.jpg").save(f"{OUT}/{id}-first.webp",quality=80)
    else:
        im.crop((0,0,w,min(hh,round(w*844/390)))).save(f"{OUT}/{id}-first.webp",quality=80,method=6)
    res[id]={"opening":has,"ms":round((te-tc)*1000)}
    print(id,res[id],flush=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for id in sys.argv[1:]:
            try: await one(b,id)
            except Exception as e: print("FAIL",id,e,flush=True)
        await b.close()
    old=json.load(open(f"{R}/play.json")) if os.path.exists(f"{R}/play.json") else {}
    old.update(res); json.dump(old,open(f"{R}/play.json","w"),indent=1)
asyncio.run(main())
