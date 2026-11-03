import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { SearchIcon, Loader2, CheckCircle2, AlertTriangle, XCircle, ArrowRightIcon } from "lucide-react";
import ScoreGauge from "../../components/ScoreGauge";
import Footer from "../../components/home/Footer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

type Check = { id: string; label: string; status: "pass" | "warn" | "fail"; message: string };
type Result = {
    url: string;
    score: number;
    checks: Check[];
    data: {
        title: string;
        description: string;
        canonical: string;
        robots: string;
        lang: string;
        og: { title: string; description: string; image: string; url: string; type: string };
        twitter: { card: string; title: string; description: string; image: string };
        h1: string[];
        h2Count: number;
        images: { total: number; missingAlt: number };
        wordCount: number;
    };
};

const statusIcon = {
    pass: <CheckCircle2 size={18} className="text-success shrink-0" />,
    warn: <AlertTriangle size={18} className="text-warning shrink-0" />,
    fail: <XCircle size={18} className="text-danger shrink-0" />,
};

const faqs = [
    { q: "What does the Meta Tag Checker check?", a: "It fetches the raw HTML of your page and checks the title tag, meta description, robots/noindex, canonical URL, H1 headings, viewport, language attribute, Open Graph tags, image alt text, structured data, and how much content is visible without JavaScript." },
    { q: "How is the SEO score calculated?", a: "Each check is weighted by its impact. Passing earns full points, a warning earns half, and a failure earns none. Indexability, title and description carry the most weight." },
    { q: "Why does my JavaScript site show very few words?", a: "The checker reads the HTML your server sends, like most crawlers do. If your content only appears after JavaScript runs, search engines may index it late and many AI crawlers won't see it at all. Prerendering or server-side rendering fixes this." },
    { q: "Is it really free?", a: "Yes. No signup needed. For full AI-powered audits with performance and accessibility checks, plus keyword rank tracking, create a free RankPilot account." },
];

export default function MetaTagChecker() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<Result | null>(null);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const { data } = await axios.get(`${BACKEND_URL}/api/tools/meta-tags`, { params: { url: url.trim() } });
            setResult(data);
        } catch (err) {
            setError(axios.isAxiosError(err) ? err.response?.data?.message || "Could not check this URL" : "Could not check this URL");
        }
        setLoading(false);
    };

    const rows = result
        ? [
              { label: "Title", value: result.data.title, extra: `${result.data.title.length} chars` },
              { label: "Meta description", value: result.data.description, extra: `${result.data.description.length} chars` },
              { label: "Canonical", value: result.data.canonical },
              { label: "Robots", value: result.data.robots || "(not set — defaults to index, follow)" },
              { label: "H1", value: result.data.h1.join(" · ") },
              { label: "H2 count", value: String(result.data.h2Count) },
              { label: "Language", value: result.data.lang },
              { label: "og:title", value: result.data.og.title },
              { label: "og:description", value: result.data.og.description },
              { label: "og:image", value: result.data.og.image },
              { label: "twitter:card", value: result.data.twitter.card },
              { label: "Images", value: `${result.data.images.total} total, ${result.data.images.missingAlt} missing alt` },
              { label: "Words in HTML", value: `~${result.data.wordCount}` },
          ]
        : [];

    return (
        <div className="min-h-screen">
            <section className="max-w-3xl mx-auto px-4 pt-32 pb-16">
                <p className="text-sm text-muted-foreground mb-3">
                    <Link to="/tools" className="hover:text-foreground">Free SEO Tools</Link> / Meta Tag Checker
                </p>
                <h1 className="text-3xl sm:text-5xl font-medium leading-tight mb-4 text-foreground">
                    Free Meta Tag Checker & <span className="gradient-text dm-serif">On-Page SEO Score</span>
                </h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    Enter any URL to check its title, meta description, canonical, Open Graph and heading tags. Get an instant SEO score with clear fixes — no signup required.
                </p>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 px-3">
                        <SearchIcon size={16} className="text-muted-foreground shrink-0" />
                        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com/page" aria-label="Website URL" className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm py-2" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-primary px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2 disabled:opacity-60" style={{ color: "var(--background)" }}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Check Tags
                    </button>
                </form>

                {error && <p className="mt-4 text-sm text-danger">{error}</p>}

                {result && (
                    <div className="mt-10 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                            <ScoreGauge score={result.score} size={120} label="On-page score" />
                            <div className="flex-1 min-w-0 w-full">
                                <p className="text-xs text-muted-foreground mb-2">Google preview</p>
                                <p className="text-xs text-muted-foreground truncate">{result.url}</p>
                                <p className="text-lg text-accent truncate">{result.data.title || "(no title)"}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{result.data.description || "(no meta description — Google will pick text from the page)"}</p>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                            {result.checks.map((check) => (
                                <div key={check.id} className="flex gap-3 p-4">
                                    {statusIcon[check.status]}
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{check.label}</p>
                                        <p className="text-sm text-muted-foreground">{check.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-border">
                                    {rows.map((row) => (
                                        <tr key={row.label}>
                                            <th className="text-left font-medium text-foreground p-3 align-top w-40">{row.label}</th>
                                            <td className="p-3 text-muted-foreground break-all">
                                                {row.value || <span className="text-danger">Missing</span>}
                                                {row.extra && row.value ? <span className="ml-2 text-xs">({row.extra})</span> : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 text-center">
                            <p className="text-foreground mb-2">Want the full picture?</p>
                            <p className="text-sm text-muted-foreground mb-4">Get an AI-powered audit with performance, accessibility and content fixes, plus daily keyword rank tracking.</p>
                            <Link to="/register" className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 rounded-full text-sm" style={{ color: "var(--background)" }}>
                                Run a free full audit <ArrowRightIcon size={14} />
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-16">
                    <h2 className="text-2xl font-medium text-foreground mb-6">Frequently asked questions</h2>
                    <div className="space-y-5">
                        {faqs.map((faq) => (
                            <div key={faq.q}>
                                <h3 className="font-medium text-foreground mb-1">{faq.q}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-8">
                        Related: <Link to="/tools/serp-preview" className="text-accent hover:underline">SERP Preview Tool</Link> ·{" "}
                        <Link to="/blog/how-to-improve-seo-score" className="text-accent hover:underline">How to improve your SEO score</Link>
                    </p>
                </div>
            </section>
            <Footer />
        </div>
    );
}
