# EthioSurvey Web Application

EthioSurvey is a lightweight web app for collecting and viewing survey feedback about Ethiopian:

- Services
- Products
- Banks

## Features

- Submit feedback with survey type, name, location, rating, and comment.
- Filter results by type (All, Service, Product, Bank).
- View quick summary with count and average rating.
- Stores entries in browser `localStorage`.
- Clear all stored surveys.

## Run locally

Because this is a static app, you can open `index.html` directly, or serve it with a local server:

```bash
python3 -m http.server 8000
```

Then browse to `http://localhost:8000`.
