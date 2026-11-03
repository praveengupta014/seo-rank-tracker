# RankPilot — SEO Rank Tracker

AI-powered SEO analyzer and Google keyword rank tracker.

- **Live site:** https://seo-rank-tracker-client-iota.vercel.app
- **API:** https://seo-rank-tracker-server-alpha.vercel.app

```
seo-rank-tracker/
├── client/   React 19 + Vite + Tailwind 4 (TypeScript), deployed on Vercel
└── server/   Express 5 + MongoDB (Mongoose), deployed on Vercel (@vercel/node)
```

## Features

| Feature | Route | Login | Powered by |
|---|---|---|---|
| AI SEO audit | `/analyze`, `/report/:id` | Yes | Browserbase (page rendering) + Gemini |
| Keyword rank tracker | `/rank-tracker`, `/rank/:id` | Yes | Serper.dev SERP API |
| Meta Tag Checker | `/tools/meta-tag-checker` | No | Server-side fetch + HTML parsing |
| SERP Preview | `/tools/serp-preview` | No | Runs in the browser |
| Blog | `/blog`, `/blog/:slug` | No | Static content in `client/src/content/blog.ts` |

## Getting started

Requirements: Node.js 20+ and a MongoDB database.

```bash
# API (http://localhost:5000)
cd server
npm install
npm run server

# Frontend (http://localhost:5173)
cd client
npm install
npm run dev
```

### Environment variables

`server/.env`

| Variable | Used for |
|---|---|
| `MONGODB_URI` | MongoDB connection |
| `JWT_SECRET` | Signing login tokens |
| `BROWSERBASE_API_KEY` | Rendering pages for the AI SEO audit |
| `GEMINI_API_KEY` | AI analysis of audited pages |
| `SERPER_API_KEY` | Google rank lookups for the rank tracker ([serper.dev](https://serper.dev)) |

`client/.env`

| Variable | Used for |
|---|---|
| `VITE_BACKEND_URL` | API base URL (defaults to `http://localhost:5000`) |
| `VITE_SITE_URL` | Public site URL used in canonical tags, sitemap and robots.txt (defaults to the production URL) |

Never commit `.env` files. Set the same variables in each Vercel project's settings, then redeploy, because Vercel only reads environment variables at deploy time.

## Workflows

### AI SEO audit

1. `POST /api/analysis/analyze` creates an `Analysis` with status `processing` and responds immediately.
2. `scraperService` opens the page in a Browserbase browser and extracts meta tags, headings, links, images and performance data.
3. `geminiService` sends the scraped data to Gemini for scoring and recommendations. If a model fails, it falls back to the next model in the list.
4. The client polls `GET /api/analysis/:id` until the status changes.

### Keyword rank tracking

```
Add keyword ─▶ status "checking" ─▶ Serper lookup (up to 5 pages / top 50) ─▶ "completed" or "failed"
```

1. `POST /api/rank/add` saves the keyword and its domain, with `www.` stripped and lowercased, then responds.
2. The check keeps running after the response through `waitUntil` from `@vercel/functions`. Without it, Vercel freezes the function and the keyword stays on `checking` forever. `server/vercel.json` allows up to 300 seconds.
3. `rankTrackerService` queries Serper one results page at a time and stops as soon as the domain is found. A result counts as a match if it is the exact domain or one of its subdomains. Each page costs 1 Serper credit.
4. `keywordTrackingService` saves the position, best position, change, competitors (top 10 other domains) and the daily history entry.
5. If the check fails, the status becomes `failed` and the reason is stored in `errorMessage`, which the UI shows in red. Retries are skipped for errors that won't fix themselves, such as a bad API key or running out of credits.
6. `POST /api/rank/:id/refresh` runs a new check.
7. Any check still on `checking` after 6 minutes is marked `failed` the next time keywords are listed or loaded.
8. The client polls each checking keyword every 5 seconds, and resumes polling after a page reload.

> Google blocks direct scraping from headless browsers with a CAPTCHA, so the rank tracker uses a SERP API instead of Browserbase. Browserbase is still used for the SEO audit, because that visits the audited website, not Google.

### Free tools API

`GET /api/tools/meta-tags?url=example.com` is a public endpoint with no login.

- Fetches the page's raw HTML without running JavaScript, the same way most crawlers do. It follows up to 3 redirects and reads at most 2 MB.
- Runs 11 weighted checks (title, description, H1, canonical, indexability, viewport, lang, Open Graph, image alt text, structured data, server-rendered word count) and returns a 0–100 score.
- **SSRF protection:** only `http` and `https` URLs are allowed. Hosts that resolve to private, loopback or link-local IPs are rejected, and this is checked again on every redirect.
- **Rate limit:** 20 checks per IP per 10 minutes, kept in memory.

## SEO setup (client)

### Build pipeline

`npm run build` runs four steps:

```
tsc -b                                    type check
vite build                                browser bundle → dist/
vite build --ssr src/entry-prerender.tsx  server render bundle → dist-ssr/
node scripts/prerender.mjs                static HTML + sitemap + robots
```

`scripts/prerender.mjs`:

- Renders every route in `PRERENDER_ROUTES` to `dist/<route>/index.html`, so crawlers and AI bots see the full content without running JavaScript. Each page gets its own title, description, canonical URL, Open Graph and Twitter tags, and JSON-LD.
- Writes `dist/spa.html`, an empty app shell marked `noindex` with no canonical URL. `client/vercel.json` serves it for every route that wasn't prerendered, such as `/dashboard`.
- Generates `sitemap.xml` from the prerendered routes and `robots.txt`, which disallows the private routes.

In the browser, `main.tsx` mounts the app with `createRoot`, and `PageMeta` keeps the head tags in sync during client-side navigation.

### Where SEO data lives

| File | Contents |
|---|---|
| `client/src/seo/routes.ts` | Title, description and JSON-LD for each public route; list of private routes |
| `client/src/content/blog.ts` | Blog posts |
| `client/index.html` | Default meta tags, `og:image`, site-wide `SoftwareApplication` schema, script that applies the saved theme before first paint |
| `client/public/og-image.png` | 1200×630 social share image |
| `client/public/google71e9d4b0707b006f.html` | Google Search Console verification. **Do not delete**, or the site loses verification. |

### Adding a blog post

1. Add an object to `blogPosts` in `client/src/content/blog.ts` with these fields: `slug`, `title`, `description`, `date`, `readMinutes`, `body` (HTML).
2. Commit and push. The page, its meta tags, the `BlogPosting` schema and its sitemap entry are generated automatically.
3. In Google Search Console, inspect the new URL and click **Request Indexing**.

### Adding a public page

1. Add the `<Route>` in `client/src/App.tsx`.
2. Add its title and description to `PUBLIC_META` in `client/src/seo/routes.ts`. That one entry handles prerendering, the sitemap and the head tags.
3. Keep the page safe to render at build time: don't touch `window`, `document` or `localStorage` during render, only inside effects or event handlers.

## Deployment

Both apps deploy automatically when you push to `main`.

| Vercel project | Root | Notes |
|---|---|---|
| Client | `client/` | Output folder is `dist`. Real files such as robots.txt and prerendered pages are served first; every other URL is rewritten to `/spa.html`. |
| Server | `server/` | Uses `@vercel/node` with `maxDuration: 300`. |

After a deploy, check:

- `/robots.txt` and `/sitemap.xml` load
- the prerendered pages show the right `<title>` in View Source
- the Search Console verification file still loads

## Known limitations

- **The daily rank check does not run on Vercel.** `server/cron/rankTrackingCron.js` uses `node-cron`, which needs a long-running server. On Vercel, rankings only update when the user clicks Refresh. To fix this, move it to Vercel Cron Jobs or an external scheduler.
- **Rank lookups use `gl=us` and `hl=en`.** There is no per-keyword country setting yet.
- **The tools rate limit is per server instance.** It is kept in memory, so it resets on cold starts.
