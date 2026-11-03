// Runs after `vite build`: renders public routes to static HTML, writes the SPA fallback,
// sitemap.xml and robots.txt. Uses the SSR bundle built from src/entry-prerender.tsx.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const { render, PRERENDER_ROUTES, PRIVATE_ROUTE_PREFIXES, SITE_URL, getPageMeta } = await import(pathToFileURL(path.join(root, "dist-ssr/entry-prerender.js")).href);

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const escapeAttr = (str) => str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const setAttr = (html, selector, attr, value) => {
    const re = new RegExp(`(<${selector}[^>]*\\s${attr}=")[^"]*(")`);
    if (!re.test(html)) throw new Error(`Tag not found in index.html: <${selector}>`);
    return html.replace(re, `$1${escapeAttr(value)}$2`);
};

const applyMeta = (html, route) => {
    const meta = getPageMeta(route);
    const url = `${SITE_URL}${route}`;
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(meta.title)}</title>`);
    html = setAttr(html, 'meta name="description"', "content", meta.description);
    html = setAttr(html, 'meta name="robots"', "content", meta.noindex ? "noindex, nofollow" : "index, follow");
    html = setAttr(html, 'link rel="canonical"', "href", url);
    html = setAttr(html, 'meta property="og:url"', "content", url);
    html = setAttr(html, 'meta property="og:type"', "content", meta.type || "website");
    html = setAttr(html, 'meta property="og:title"', "content", meta.title);
    html = setAttr(html, 'meta property="og:description"', "content", meta.description);
    html = setAttr(html, 'meta name="twitter:title"', "content", meta.title);
    html = setAttr(html, 'meta name="twitter:description"', "content", meta.description);
    if (meta.jsonLd) {
        const json = JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c");
        html = html.replace("</head>", `  <script type="application/ld+json">${json}</script>\n  </head>`);
    }
    return html;
};

// SPA fallback for private/unknown routes: no prerendered content, not indexable
let spa = setAttr(template, 'meta name="robots"', "content", "noindex, nofollow");
spa = spa.replace(/\s*<link rel="canonical"[^>]*>/, "");
fs.writeFileSync(path.join(dist, "spa.html"), spa);

for (const route of PRERENDER_ROUTES) {
    const appHtml = render(route);
    const html = applyMeta(template, route).replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
    const file = route === "/" ? path.join(dist, "index.html") : path.join(dist, route, "index.html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    console.log(`prerendered ${route}`);
}

const lastmod = new Date().toISOString().split("T")[0];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PRERENDER_ROUTES.map((route) => `    <url>
        <loc>${SITE_URL}${route}</loc>
        <lastmod>${lastmod}</lastmod>
    </url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);

const robots = ["User-agent: *", "Allow: /", ...PRIVATE_ROUTE_PREFIXES.map((prefix) => `Disallow: ${prefix}`), "", `Sitemap: ${SITE_URL}/sitemap.xml`, ""].join("\n");
fs.writeFileSync(path.join(dist, "robots.txt"), robots);

fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });
