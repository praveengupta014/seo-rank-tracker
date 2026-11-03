import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMeta, SITE_URL } from "../seo/routes";

function setTag(selector: string, attr: string, value: string) {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement(selector.startsWith("link") ? "link" : "meta");
        const [, key, name] = selector.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/) || [];
        if (key && name) el.setAttribute(key, name);
        document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
}

// Updates title, description, canonical and robots tags on every client-side route change.
// The same data is baked into prerendered HTML at build time (scripts/prerender.mjs).
export default function PageMeta() {
    const { pathname } = useLocation();

    useEffect(() => {
        const { title, description, noindex, type = "website" } = getPageMeta(pathname);
        const url = `${SITE_URL || window.location.origin}${pathname}`;

        document.title = title;
        setTag('meta[name="description"]', "content", description);
        setTag('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");
        setTag('link[rel="canonical"]', "href", url);
        setTag('meta[property="og:url"]', "content", url);
        setTag('meta[property="og:type"]', "content", type);
        setTag('meta[property="og:title"]', "content", title);
        setTag('meta[property="og:description"]', "content", description);
        setTag('meta[name="twitter:title"]', "content", title);
        setTag('meta[name="twitter:description"]', "content", description);
    }, [pathname]);

    return null;
}
