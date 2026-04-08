# Leumi web (server + SPA)

Express API that runs [`israeli-bank-scrapers`](https://github.com/eshaham/israeli-bank-scrapers) for **Bank Leumi**, plus a **Vite + React** single-page UI that displays results.

## Security model (read this)

- **Not persisted:** The server does **not** write usernames or passwords to disk, databases, or logs. Request bodies are never logged.
- **Ephemeral on server:** For each “Fetch from Leumi” click, credentials are sent over HTTPS to **your** API, held in memory for the scrape, then discarded. That is **weaker** than a fully local desktop app (see `../Test_app`).
- **Production:** Use HTTPS, set `CLIENT_ORIGIN` to your frontend origin(s), and run behind a host that supports Chromium/Puppeteer (often **Docker**).

## Prerequisites

- **Node.js** ≥ 22.13
- **npm** (workspaces)
- Chromium/Chrome available to Puppeteer (bundled by `israeli-bank-scrapers`, or set **`CHROME_PATH`** to a Chrome binary)

## Install

From the `Web` folder:

```bash
npm install
```

## Development

Run **API** and **client** together (two processes):

```bash
npm run dev
```

- **API:** [http://127.0.0.1:8787](http://127.0.0.1:8787) — `GET /health`, `GET /api/demo`, `POST /api/scrape`
- **UI:** [http://127.0.0.1:5173](http://127.0.0.1:5173) — Vite proxies `/api` and `/health` to the API

**Client routes:** `/login` (sign-in & sync), `/dashboard` (**finance report** layout with [Recharts](https://recharts.org/) — cumulative flow + inflow/outflow bars, KPI strip, export), `/accounts`, `/settings` (theme, CSV export, clear session). **Light/dark** theme is toggled in the shell and on the login screen; preference is stored in `localStorage`.

Dashboard UI is aligned with the client-selected reference: [Finance Report Dashboard · SaaS Web App](https://dribbble.com/shots/26645893-Finance-Report-Dashboard-Saas-Web-App) (report chrome, analytics chart, comparison widget — original implementation, not a pixel copy).

Or run them separately:

```bash
npm run dev -w leumi-web-server
npm run dev -w leumi-web-client
```

### Environment (server)

| Variable        | Meaning                                      |
|----------------|----------------------------------------------|
| `PORT`         | API port (default `8787`)                    |
| `CLIENT_ORIGIN`| Comma-separated allowed CORS origins (optional) |
| `CHROME_PATH`  | Path to Chrome/Chromium if needed          |
| `TZ`           | Default `Asia/Jerusalem` if unset          |

### Environment (client build)

| Variable          | Meaning                                                |
|-------------------|--------------------------------------------------------|
| `VITE_API_BASE`   | Absolute API origin for production (e.g. `https://api.example.com`). Empty = same-origin / dev proxy. |

## Production build

```bash
npm run build
```

- Server output: `server/dist/` — start with `node server/dist/index.js` (after `npm run build -w leumi-web-server`).
- Client static files: `client/dist/` — host on any static file host; point `VITE_API_BASE` at your API and enable CORS on the server.

## Rate limiting

`POST /api/scrape` is limited (default **20 requests / 15 minutes** per IP) via `express-rate-limit`.
