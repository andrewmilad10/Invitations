import asyncio,sys,base64
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        pg=await b.new_page(viewport={"width":1200,"height":900})
        errs=[]; pg.on("console", lambda m: print("LOG",m.type,m.text[:300], flush=True)); pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.set_viewport_size({"width":1400,"height":1400}); await pg.goto("http://localhost:8765/"+sys.argv[1])
        await pg.wait_for_function("window.__png", timeout=600000)
        data=await pg.evaluate("window.__png")
        open(sys.argv[2],"wb").write(base64.b64decode(data.split(",")[1]))
        print(errs[:5]); await b.close()
asyncio.run(main())
