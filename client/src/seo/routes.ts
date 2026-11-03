import { blogPosts } from "../content/blog";

export const SITE_URL: string = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
export const SITE_NAME = "RankPilot";

export const DEFAULT_TITLE = "RankPilot — Free AI SEO Analyzer & Website Audit Tool";
export const DEFAULT_DESCRIPTION = "RankPilot — AI-powered SEO analyzer. Get instant SEO audits, performance scores, keyword analysis, and actionable recommendations for any website.";

export type PageMetaData = {
    title: string;
    description: string;
    noindex?: boolean;
    type?: "website" | "article";
    jsonLd?: Record<string, unknown>;
};

const PUBLIC_META: Record<string, PageMetaData> = {
    "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
    "/login": { title: "Log In — RankPilot SEO Analyzer", description: "Log in to RankPilot to run AI-powered SEO audits and track your keyword rankings." },
    "/register": { title: "Sign Up Free — RankPilot SEO Analyzer", description: "Create a free RankPilot account to get instant AI SEO audits and Google keyword rank tracking." },
    "/tools": {
        title: "Free SEO Tools — Meta Tag Checker & SERP Preview | RankPilot",
        description: "Free SEO tools with no signup: check any page's meta tags and on-page SEO score, and preview how your title and description look in Google.",
    },
    "/tools/meta-tag-checker": {
        title: "Free Meta Tag Checker — Instant On-Page SEO Score | RankPilot",
        description: "Check any URL's title, meta description, canonical, Open Graph and H1 tags in seconds. Get a free on-page SEO score and fixes — no signup needed.",
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "RankPilot Meta Tag Checker",
            applicationCategory: "SEO Tool",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
    },
    "/tools/serp-preview": {
        title: "Google SERP Preview Tool — Title & Meta Description Length Checker",
        description: "Preview how your page title and meta description appear in Google search results on desktop and mobile. Free pixel-based length checker.",
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "RankPilot SERP Preview Tool",
            applicationCategory: "SEO Tool",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
    },
    "/blog": {
        title: "SEO Blog — Practical Guides to Rank Higher | RankPilot",
        description: "Practical, no-fluff SEO guides: improve your SEO score, write better meta tags, and track keyword rankings on Google.",
    },
};

for (const post of blogPosts) {
    PUBLIC_META[`/blog/${post.slug}`] = {
        title: `${post.title} | RankPilot`,
        description: post.description,
        type: "article",
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.updated || post.date,
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: { "@type": "Organization", name: SITE_NAME },
            image: `${SITE_URL}/og-image.png`,
            mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        },
    };
}

// Routes rendered to static HTML at build time (and listed in sitemap.xml)
export const PRERENDER_ROUTES = Object.keys(PUBLIC_META);

const PRIVATE_TITLES: [string, string][] = [
    ["/dashboard", "Dashboard"],
    ["/analyze", "Analyze Website"],
    ["/report/", "SEO Report"],
    ["/history", "Analysis History"],
    ["/rank-tracker", "Keyword Rank Tracker"],
    ["/rank/", "Keyword Ranking Details"],
];

export const PRIVATE_ROUTE_PREFIXES = PRIVATE_TITLES.map(([prefix]) => prefix);

export function getPageMeta(pathname: string): PageMetaData {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    if (PUBLIC_META[path]) return PUBLIC_META[path];
    const match = PRIVATE_TITLES.find(([prefix]) => path.startsWith(prefix));
    return { title: match ? `${match[1]} — RankPilot` : DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, noindex: true };
}
