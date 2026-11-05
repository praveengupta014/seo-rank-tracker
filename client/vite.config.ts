import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // Used for canonical URLs, sitemap.xml and robots.txt (see scripts/prerender.mjs)
    const siteUrl = (env.VITE_SITE_URL || "https://www.seoranktracker.dev").replace(/\/$/, "");
    process.env.VITE_SITE_URL = siteUrl;

    return {
        plugins: [react(), tailwindcss()],
    };
});
