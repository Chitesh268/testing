# ARISE — Player System (Solo Leveling style)

A real-life leveling tracker built with React + Vite. Native full-screen UI (no iframe), with the System
notification on open, the Player Record status window, and animated electric / flame / aura borders.

## Run locally
```
npm install
npm run dev      # development
npm run build    # production build in dist/
```

## Publish on GitHub Pages
1. Push this folder to the `main` branch of your repo (`Chitesh268/anima`).
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy-pages.yml`) builds and deploys automatically.
   Your site will be at `https://chitesh268.github.io/anima/`.

## Save data
Same format as before (`localStorage` key `solo-system-v2`), so existing progress and exported
backups keep working on the same browser.

## Effects
Settings → **Visual effects**: High (electric borders, flames, lightning), Medium (default on phones), Off.
Reduced-motion system settings turn effects off automatically.

## Notes
The app only uses `react` and `react-dom`. `framer-motion` and `lucide-react` are still listed in
`package.json` (so `package-lock.json` stays in sync for `npm ci`) but are unused; remove them any time with
`npm uninstall framer-motion lucide-react`.
