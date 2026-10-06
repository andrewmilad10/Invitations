"""Photograph each live design's opening and first screen for the marketing pages (see src/features/marketing/home/screens.ts)."""
import asyncio, glob, zlib, io
from PIL import Image
from playwright.async_api import async_playwright
IDS=["swan-lake","villa-rosa","something-blue","cotton-press","rose-marble","burgundy-envelope","the-gate","moonlit-nile","pressed-garden","set-sail","message-in-a-bottle","garden-gate"]
OUT="public/marketing/screens/"  # run from the repo root with the site running on :3100
imgs=sorted(glob.glob("public/samples/*.jpg"))
async def shot(b,id):
    pg=await b.new_page(viewport={"width":390,"height":844},device_scale_factor=2)
    async def stub(route): await route.fulfill(path=imgs[zlib.crc32(route.request.url.encode())%len(imgs)], content_type="image/jpeg")
    await pg.route(lambda u: "unsplash" in u, stub)
    await pg.goto(f"http://localhost:3100/templates/{id}/preview", wait_until="load"); await pg.wait_for_timeout(3500)
    # hide the editor/preview chrome if any (skip button stays inside dialog)
    await pg.add_style_tag(content="[role=dialog] button:not([aria-label]){visibility:hidden}")
    def save(png,name):
        Image.open(io.BytesIO(png)).convert("RGB").save(OUT+name,"WEBP",quality=82,method=6)
    save(await pg.screenshot(),f"{id}-opening.webp")
    d=pg.locator('[role=dialog]')
    if id=="message-in-a-bottle":
        await pg.wait_for_timeout(5000); save(await pg.screenshot(),f"{id}-opening.webp")
        await pg.locator('button[class*="tapRing"]').click(force=True); await pg.wait_for_timeout(9000)
    elif await d.count():
        await d.locator('button[aria-label]').first.click(force=True)
        try: await pg.wait_for_selector('[role=dialog]', state="detached", timeout=12000)
        except: pass
    await pg.wait_for_timeout(3500)
    await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(600)
    save(await pg.screenshot(),f"{id}-hero.webp")
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
        import sys
        for id in (sys.argv[1].split(",") if len(sys.argv)>1 else IDS): await shot(b,id)
        await b.close()
asyncio.run(main())
