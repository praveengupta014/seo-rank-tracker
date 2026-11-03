import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Public routes that should be indexed. Private (logged-in) routes are disallowed in robots.txt.
const PUBLIC_ROUTES = ["/", "/login", "/register"];
const PRIVATE_ROUTES = ["/dashboard", "/analyze", "/report/", "/history", "/rank-tracker", "/rank/"];

// Emits robots.txt and sitemap.xml at build time using VITE_SITE_URL
function seoFiles(siteUrl: string): Plugin {
    return {
        name: "seo-files",
        apply: "build",
        generateBundle() {
            const robots = [
                "User-agent: *",
                "Allow: /",
                ...PRIVATE_ROUTES.map((route) => `Disallow: ${route}`),
                "",
                `Sitemap: ${siteUrl}/sitemap.xml`,
                "",
            ].join("\n");

            const lastmod = new Date().toISOString().split("T")[0];
            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_ROUTES.map((route) => `    <url>
        <loc>${siteUrl}${route}</loc>
        <lastmod>${lastmod}</lastmod>
        <priority>${route === "/" ? "1.0" : "0.5"}</priority>
    </url>`).join("\n")}
</urlset>
`;

            this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
            this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
        },
    };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const siteUrl = (env.VITE_SITE_URL || "https://seo-rank-tracker-client-iota.vercel.app").replace(/\/$/, "");
    process.env.VITE_SITE_URL = siteUrl;

    return {
        plugins: [react(), tailwindcss(), seoFiles(siteUrl)],
    };
});
