# 13579 — No. 1 product page

Interactive product page for 13579's first drop (No. 1 EDP). Built with React + Vite.

## What's in here

- Animated liquid-fill concentration meter (0 to 21%)
- Comparison bar chart (recharts) vs deodorant/EDT/EDP concentrations
- Interactive full-bleed hero: cursor position scrubs through a 96-frame sprite sheet of the brand mascot, with eased interpolation and a graceful return to idle
- Auto-scrolling reviews, notes pyramid, "five digits five drops" range teaser, manifesto section, FAQ accordion
- Country toggle (IN/US) driving price display and the "Buy on Amazon" link/redirect
- Sticky bottom buy bar once the main CTA scrolls out of view

## Setup

```bash
npm install
npm run dev
```

This starts a local dev server (Vite will print the URL, typically `http://localhost:5173`).

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally with `npm run preview`.

## Deploying (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub**, select this repo.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy. Netlify will auto-redeploy on every push to `main`.

## Before going further

- Replace the Amazon links in `AMAZON_LINKS` inside `src/App.jsx` (search for `REPLACE_WITH_ASIN`) with your real India and US listing URLs.
- `trackAmazonClick` and the country auto-detection are stubbed with `console.log`/browser-locale fallbacks — wire in real GA4/Meta pixel events and (if using Shopify later) Shopify Markets geolocation.
- `public/sprite-sheet.png` is the 96-frame hero sprite sheet extracted from the source video via FFmpeg (see the comment at the top of `src/App.jsx` for the exact command used, including the Gemini watermark removal).
- Pricing, product description, and review content are placeholders pulled from earlier drafts — double check before launch.
