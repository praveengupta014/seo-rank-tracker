import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

const DEFAULT_TITLE = "RankPilot — Free AI SEO Analyzer & Website Audit Tool";
const DEFAULT_DESCRIPTION = "RankPilot — AI-powered SEO analyzer. Get instant SEO audits, performance scores, keyword analysis, and actionable recommendations for any website.";

type Meta = { title: string; description?: string; noindex?: boolean };

const PUBLIC_META: Record<string, Meta> = {
    "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
    "/login": { title: "Log In — RankPilot SEO Analyzer", description: "Log in to RankPilot to run AI-powered SEO audits and track your keyword rankings." },
    "/register": { title: "Sign Up Free — RankPilot SEO Analyzer", description: "Create a free RankPilot account to get instant AI SEO audits and Google keyword rank tracking." },
};

const PRIVATE_TITLES: [string, string][] = [
    ["/dashboard", "Dashboard"],
    ["/analyze", "Analyze Website"],
    ["/report/", "SEO Report"],
    ["/history", "Analysis History"],
    ["/rank-tracker", "Keyword Rank Tracker"],
    ["/rank/", "Keyword Ranking Details"],
];

function getMeta(pathname: string): Meta {
    if (PUBLIC_META[pathname]) return PUBLIC_META[pathname];
    const match = PRIVATE_TITLES.find(([prefix]) => pathname.startsWith(prefix));
    return { title: match ? `${match[1]} — RankPilot` : DEFAULT_TITLE, noindex: true };
}

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

// Updates title, description, canonical and robots tags on every route change
export default function PageMeta() {
    const { pathname } = useLocation();

    useEffect(() => {
        const { title, description = DEFAULT_DESCRIPTION, noindex } = getMeta(pathname);
        const url = `${SITE_URL.replace(/\/$/, "")}${pathname}`;

        document.title = title;
        setTag('meta[name="description"]', "content", description);
        setTag('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");
        setTag('link[rel="canonical"]', "href", url);
        setTag('meta[property="og:url"]', "content", url);
        setTag('meta[property="og:title"]', "content", title);
        setTag('meta[name="twitter:title"]', "content", title);
    }, [pathname]);

    return null;
}
