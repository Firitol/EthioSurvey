# EthioSurvey Web Application

EthioSurvey is a web app for collecting and viewing survey feedback about Ethiopian:

- Services
- Products
- Banks

## Features

- Submit feedback with survey type, name, location, rating, and comment.
- Filter results by type (All, Service, Product, Bank).
- View quick summary with count and average rating.
- Stores entries in browser `localStorage`.
- Works as an installable PWA with offline caching.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Install as an app (PWA)

1. Open the deployed HTTPS URL in Chrome/Edge on Android.
2. Tap **Install EthioSurvey** (or browser menu > Install app).
3. The app launches in standalone mode like a native app.

## Important repository note

This branch avoids committing binary assets, so app icons in this repository are SVG files (`icons/*.svg`).
If your release flow requires PNG icons, generate PNGs during CI/release and host them on your production domain.

## Publish to Google Play Store (downloadable by everyone)

Use **Trusted Web Activity (TWA)** to publish the app in Play Store.

### 1) Deploy the web app publicly (HTTPS)

Deploy this app to a stable HTTPS domain (example: `https://ethiosurvey.example.com`).

### 2) Prepare production PNG icons

Generate production PNG icons (at least 512x512) and host them, for example:

- `https://YOUR_DOMAIN/icons/playstore-512.png`
- `https://YOUR_DOMAIN/icons/playstore-maskable-512.png`

### 3) Update TWA config

Edit `twa-manifest.json` with your real values:

- `packageId` (unique Android package)
- `host` (your production host)
- `iconUrl` and `maskableIconUrl` (hosted PNGs)

### 4) Generate Android project with Bubblewrap

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.webmanifest
bubblewrap build
```

This produces an Android App Bundle (`.aab`) for Play Console.

#### Troubleshooting archive extraction errors

If you see errors like:

```text
gzip: stdin: invalid compressed data--format violated
tar: Unexpected EOF in archive
tar: Error is not recoverable: exiting now
```

the downloaded archive is usually incomplete or corrupted. Try:

1. Remove the broken file and re-download it.
2. Verify it is a valid gzip/tar before extracting:

   ```bash
   gzip -t <archive>.tar.gz
   tar -tzf <archive>.tar.gz >/dev/null
   ```

3. If download keeps failing, use a more resilient download command:

   ```bash
   curl -fL --retry 5 --retry-delay 2 -o <archive>.tar.gz <url>
   ```

4. If this happened during package installation, clear the package cache and retry.
   For npm:

   ```bash
   npm cache clean --force
   npm install
   ```

### 5) Set up Digital Asset Links

Bubblewrap prints your SHA256 signing fingerprint and required `assetlinks.json`.
Host the generated file at:

`https://YOUR_DOMAIN/.well-known/assetlinks.json`

### 6) Publish in Play Console

- Create app in Google Play Console
- Upload `.aab`
- Fill store listing, privacy policy, and required declarations
- Submit for review

After approval, users can download EthioSurvey directly from Play Store.
