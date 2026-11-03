/* eslint-disable react-refresh/only-export-components */
// Server entry used only at build time by scripts/prerender.mjs to render public pages to HTML.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";

export { PRERENDER_ROUTES, PRIVATE_ROUTE_PREFIXES, SITE_URL, getPageMeta } from "./seo/routes";

export function render(url: string) {
    return renderToString(
        <StaticRouter location={url}>
            <ThemeProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </ThemeProvider>
        </StaticRouter>
    );
}
