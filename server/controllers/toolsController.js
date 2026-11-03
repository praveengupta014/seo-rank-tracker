import dns from "dns/promises";
import net from "net";

// Public, no-login SEO tools. Keep these cheap: plain fetch + regex parsing, no browser.

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 10000;
const MAX_REDIRECTS = 3;

// Simple in-memory rate limit: 20 checks per IP per 10 minutes
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

const isRateLimited = (ip) => {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > RATE_LIMIT;
};

const isPrivateIp = (ip) => {
    if (net.isIPv4(ip)) {
        const [a, b] = ip.split(".").map(Number);
        return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
    }
    const lower = ip.toLowerCase();
    if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice(7));
    return lower === "::" || lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
};

// Blocks localhost / internal network targets (SSRF protection)
const assertPublicUrl = async (url) => {
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http and https URLs are supported");
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((a) => a.address);
    if (!addresses.length || addresses.some(isPrivateIp)) throw new Error("This URL cannot be checked");
};

const fetchHtml = async (startUrl) => {
    let url = startUrl;
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
        await assertPublicUrl(url);
        const res = await fetch(url, {
            redirect: "manual",
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RankPilotBot/1.0; +https://seo-rank-tracker-client-iota.vercel.app)", Accept: "text/html" },
        });

        if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
            url = new URL(res.headers.get("location"), url);
            continue;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("html")) throw new Error("URL did not return an HTML page");

        // Read up to MAX_BYTES
        const reader = res.body.getReader();
        const chunks = [];
        let size = 0;
        while (size < MAX_BYTES) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            size += value.length;
        }
        reader.cancel().catch(() => {});

        return { html: Buffer.concat(chunks).toString("utf8"), finalUrl: url.toString(), status: res.status, xRobotsTag: res.headers.get("x-robots-tag") };
    }
    throw new Error("Too many redirects");
};

const decode = (str = "") =>
    str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;|&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const stripTags = (str = "") => decode(str.replace(/<[^>]*>/g, " "));

const getAttr = (tag, name) => {
    const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
    return match ? decode(match[1] ?? match[2] ?? match[3]) : null;
};

const parseHtml = (html) => {
    const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] || html;
    const metaTags = head.match(/<meta\b[^>]*>/gi) || [];
    const linkTags = head.match(/<link\b[^>]*>/gi) || [];

    const meta = {};
    for (const tag of metaTags) {
        const key = (getAttr(tag, "name") || getAttr(tag, "property") || "").toLowerCase();
        const content = getAttr(tag, "content");
        if (key && content !== null && !(key in meta)) meta[key] = content;
    }

    const canonicalTag = linkTags.find((tag) => /rel\s*=\s*["']?canonical/i.test(tag));
    const bodyHtml = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
    const headings = (level) => (bodyHtml.match(new RegExp(`<h${level}\\b[^>]*>[\\s\\S]*?<\\/h${level}>`, "gi")) || []).map(stripTags).filter(Boolean);
    const images = bodyHtml.match(/<img\b[^>]*>/gi) || [];
    const wordCount = stripTags(bodyHtml.match(/<body[\s\S]*<\/body>/i)?.[0] || "").split(" ").filter(Boolean).length;

    return {
        title: stripTags(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""),
        description: meta["description"] || "",
        robots: meta["robots"] || "",
        viewport: meta["viewport"] || "",
        canonical: canonicalTag ? getAttr(canonicalTag, "href") : "",
        lang: getAttr(html.match(/<html\b[^>]*>/i)?.[0] || "", "lang") || "",
        og: {
            title: meta["og:title"] || "",
            description: meta["og:description"] || "",
            image: meta["og:image"] || "",
            url: meta["og:url"] || "",
            type: meta["og:type"] || "",
        },
        twitter: {
            card: meta["twitter:card"] || "",
            title: meta["twitter:title"] || "",
            description: meta["twitter:description"] || "",
            image: meta["twitter:image"] || "",
        },
        h1: headings(1),
        h2Count: headings(2).length,
        images: { total: images.length, missingAlt: images.filter((img) => getAttr(img, "alt") === null).length },
        hasStructuredData: /application\/ld\+json/i.test(html),
        wordCount,
    };
};

// Each check: pass / warn / fail + message. Score = weighted share of points earned.
const buildChecks = (data) => {
    const checks = [];
    const add = (id, label, status, message, weight = 10) => checks.push({ id, label, status, message, weight });

    const titleLen = data.title.length;
    if (!titleLen) add("title", "Title tag", "fail", "No <title> tag found. Every page needs a unique, descriptive title.", 20);
    else if (titleLen < 30) add("title", "Title tag", "warn", `Title is ${titleLen} characters — short. Aim for 50–60 and include your main keyword.`, 20);
    else if (titleLen > 60) add("title", "Title tag", "warn", `Title is ${titleLen} characters — Google may truncate it after ~60.`, 20);
    else add("title", "Title tag", "pass", `Title length is ${titleLen} characters — good.`, 20);

    const descLen = data.description.length;
    if (!descLen) add("description", "Meta description", "fail", "No meta description. Google will pick random page text for your snippet.", 15);
    else if (descLen < 70) add("description", "Meta description", "warn", `Description is ${descLen} characters — too short to sell the click. Aim for 120–160.`, 15);
    else if (descLen > 160) add("description", "Meta description", "warn", `Description is ${descLen} characters — likely truncated after ~160.`, 15);
    else add("description", "Meta description", "pass", `Description length is ${descLen} characters — good.`, 15);

    if (!data.h1.length) add("h1", "H1 heading", "fail", "No H1 heading found. Add one clear H1 that describes the page.", 10);
    else if (data.h1.length > 1) add("h1", "H1 heading", "warn", `${data.h1.length} H1 headings found. Use a single H1 per page.`, 10);
    else add("h1", "H1 heading", "pass", "Exactly one H1 heading — good.", 10);

    if (data.canonical) add("canonical", "Canonical URL", "pass", "Canonical tag is set.", 10);
    else add("canonical", "Canonical URL", "warn", "No canonical tag. Add one to avoid duplicate-content issues.", 10);

    const noindex = /noindex/i.test(data.robots) || /noindex/i.test(data.xRobotsTag || "");
    if (noindex) add("robots", "Indexability", "fail", "Page is set to noindex — it will not appear in Google.", 15);
    else add("robots", "Indexability", "pass", "Page can be indexed.", 15);

    if (data.viewport) add("viewport", "Mobile viewport", "pass", "Viewport meta tag is set.", 5);
    else add("viewport", "Mobile viewport", "fail", "No viewport meta tag — page may not be mobile-friendly.", 5);

    if (data.lang) add("lang", "Language attribute", "pass", `<html lang="${data.lang}"> is set.`, 5);
    else add("lang", "Language attribute", "warn", "Missing lang attribute on <html>.", 5);

    const ogMissing = ["title", "description", "image"].filter((k) => !data.og[k]);
    if (!ogMissing.length) add("og", "Open Graph tags", "pass", "og:title, og:description and og:image are set.", 10);
    else add("og", "Open Graph tags", ogMissing.length === 3 ? "fail" : "warn", `Missing ${ogMissing.map((k) => `og:${k}`).join(", ")} — social shares will look plain.`, 10);

    if (!data.images.total) add("alt", "Image alt text", "pass", "No images on the page.", 5);
    else if (data.images.missingAlt) add("alt", "Image alt text", "warn", `${data.images.missingAlt} of ${data.images.total} images have no alt attribute.`, 5);
    else add("alt", "Image alt text", "pass", `All ${data.images.total} images have alt text.`, 5);

    if (data.hasStructuredData) add("schema", "Structured data", "pass", "JSON-LD structured data found.", 5);
    else add("schema", "Structured data", "warn", "No JSON-LD structured data. Schema can earn rich results.", 5);

    if (data.wordCount < 50) add("content", "Server-rendered content", "warn", `Only ~${data.wordCount} words in the raw HTML. If your site renders with JavaScript, crawlers and AI bots may see an empty page.`, 10);
    else add("content", "Server-rendered content", "pass", `~${data.wordCount} words visible in the raw HTML.`, 10);

    const total = checks.reduce((sum, c) => sum + c.weight, 0);
    const earned = checks.reduce((sum, c) => sum + (c.status === "pass" ? c.weight : c.status === "warn" ? c.weight / 2 : 0), 0);
    return { score: Math.round((earned / total) * 100), checks };
};

// GET /api/tools/meta-tags?url=example.com
export const checkMetaTags = async (req, res) => {
    try {
        const input = String(req.query.url || "").trim();
        if (!input) return res.status(400).json({ success: false, message: "URL is required" });

        if (isRateLimited(req.ip)) return res.status(429).json({ success: false, message: "Too many checks. Please try again in a few minutes." });

        let url;
        try {
            if (/^[a-z][a-z0-9+.-]*:\/\//i.test(input) && !/^https?:\/\//i.test(input)) throw new Error();
            url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
        } catch {
            return res.status(400).json({ success: false, message: "Invalid URL format" });
        }

        const { html, finalUrl, status, xRobotsTag } = await fetchHtml(url);
        const data = { ...parseHtml(html), xRobotsTag };
        const { score, checks } = buildChecks(data);
        delete data.xRobotsTag;

        res.json({ success: true, url: finalUrl, status, score, checks, data });
    } catch (error) {
        const code = error.code || error.cause?.code;
        const message =
            error.name === "TimeoutError" ? "The website took too long to respond"
            : code === "ENOTFOUND" ? "Domain not found. Check the URL and try again."
            : code ? "Could not connect to this website"
            : error.message || "Could not fetch this URL";
        res.status(422).json({ success: false, message });
    }
};
