# Paper flowers

How the Something Blue art (public/templates/something-blue) is made: paper-craft
flowers built in three.js (`paper.js`: rose, hydrangea, blossom, leaf, sprig,
pearl), arranged in `comp.html` and rendered with soft shadows to transparent PNGs.
`?c=envelope` renders the same flowers pressed into white paper (blind relief).

    cd tools/paper-flowers && npm i --no-save three@0.170.0
    python3 -m http.server 8765 &
    python3 r3d.py "comp.html?c=arch&layer=bloom" wreath-bloom.png   # also: arch&layer=green, corner, posy, spray, envelope

Convert to webp before adding to public/. Change colours and layouts in comp.html;
`srand(n)` fixes each arrangement so renders are repeatable.
