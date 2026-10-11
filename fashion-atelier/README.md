# Blair's Fashion Atelier

Static fashion trend intelligence app for [Blair Page](https://blairyfairy.github.io/BlairPage/).

## Deploy (GitHub Pages)

Copy the entire `fashion-atelier/` folder into the root of the `BlairPage` repo (alongside `index.html`):

```
BlairPage/
  index.html          ← already updated with nav + project card links
  fashion-atelier/
    index.html
    atelier.css
    atelier.js
    README.md
```

Live URL: `https://blairyfairy.github.io/BlairPage/fashion-atelier/`

## Features

- **Look analyzer** — drag/drop or file picker; canvas-based dominant color extraction; mood + season narrative; copyable hex swatches
- **Signal board** — social heat, retail readiness, runway echo, fatigue risk meters driven by live headline lexicon scoring
- **Keyword radar** — hot / warm / cool trend tags from press text
- **Fashion press radar** — public RSS (Vogue, Business of Fashion, Fashionista, Who What Wear, Highsnobiety) via CORS proxies — **no API keys**
- **Visual mood board** — Unsplash Source fashion imagery (no key)
- **Horizon forecast** — curated seasonal narrative timeline
- **Responsive** — desktop, tablet, phone; sticky header; accessible structure
- **Brand-aligned** — midnight violet, dusty mauve, ghost white glass system matching the portfolio

## Privacy

Uploaded images never leave the browser. Only public RSS endpoints are requested through CORS helpers.
