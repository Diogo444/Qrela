# Qrela — Générateur de QR Code (100% front-end)

Générateur de QR code gratuit, moderne et rapide (aucun back-end).

## Commandes

Scaffold (référence demandée) :

```bash
npm create vite@latest qr-generator -- --template vanilla
```

Installation / dev / build :

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Stack

- Vite
- Vanilla JavaScript (modules ES)
- Tailwind CSS
- `qr-code-styling` (lib de génération principale)

## Structure

- `index.html` : page home + UI du générateur + SEO
- `pages/` : pages statiques SEO (FAQ, Confidentialité, À propos) + `robots.txt` + `sitemap.xml`
- `public/` : assets statiques (`favicon.svg`, `og-image.png`)
- `src/main.js` : bootstrap
- `src/qr/` : instance, update, export, payload
- `src/ui/` : bindings DOM, state, render, aides, ads placeholders
- `src/utils/` : validateurs, debounce, presets

## URL du site (SEO)

Les balises `canonical`, OpenGraph et Twitter utilisent `VITE_SITE_URL`.

- Modifiez `VITE_SITE_URL` dans `.env` (ou créez un `.env.local`) avant de déployer.

## Publicités (AdSense) — placeholders

Les emplacements sont prêts, sans clé ni script :

- `src/ui/ads.js` : remplacez le HTML placeholder par votre code AdSense
- Slots :
  - sous le header : `#ad-slot-top`
  - colonne gauche (home) : `#ad-slot-left`
  - avant le footer : `#ad-slot-bottom`

## Déploiement

Cloudflare Pages :

- Build command : `npm run build`
- Output directory : `dist`
- (optionnel) Variables : `VITE_SITE_URL=https://votre-domaine.tld`

Vercel :

- Framework : Vite
- Build command : `npm run build`
- Output directory : `dist`
- Variable d'env : `VITE_SITE_URL`

