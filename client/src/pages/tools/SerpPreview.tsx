import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import Footer from "../../components/home/Footer";

// Approximate Google result limits (pixels) and fonts
const LIMITS = {
    desktop: { title: 600, description: 920, titleFont: "20px Arial", descFont: "14px Arial" },
    mobile: { title: 560, description: 680, titleFont: "18px Arial", descFont: "14px Arial" },
};

let canvas: HTMLCanvasElement | null = null;
const measure = (text: string, font: string) => {
    if (typeof document === "undefined") return text.length * 9;
    canvas ??= document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = font;
    return ctx.measureText(text).width;
};

// Cut text to fit maxWidth, adding an ellipsis like Google does
const truncate = (text: string, font: string, maxWidth: number) => {
    if (measure(text, font) <= maxWidth) return { text, cut: false };
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (measure(text.slice(0, mid) + " …", font) <= maxWidth) lo = mid;
        else hi = mid - 1;
    }
    return { text: text.slice(0, lo).trimEnd() + " …", cut: true };
};

const Meter = ({ label, chars, px, max, ideal }: { label: string; chars: number; px: number; max: number; ideal: string }) => {
    const pct = Math.min(100, (px / max) * 100);
    const color = px > max ? "bg-danger" : pct < 50 ? "bg-warning" : "bg-success";
    return (
        <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{label}: {chars} chars · {Math.round(px)} / {max}px</span>
                <span>Ideal: {ideal}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

export default function SerpPreview() {
    const [title, setTitle] = useState("Free Meta Tag Checker — Instant On-Page SEO Score | RankPilot");
    const [description, setDescription] = useState("Check any URL's title, meta description, canonical, Open Graph and H1 tags in seconds. Get a free on-page SEO score and fixes — no signup needed.");
    const [url, setUrl] = useState("seo-rank-tracker-client-iota.vercel.app › tools");
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

    const limits = LIMITS[device];
    const preview = useMemo(
        () => ({
            titlePx: measure(title, limits.titleFont),
            descPx: measure(description, limits.descFont),
            title: truncate(title, limits.titleFont, limits.title),
            description: truncate(description, limits.descFont, limits.description),
        }),
        [title, description, limits]
    );

    return (
        <div className="min-h-screen">
            <section className="max-w-3xl mx-auto px-4 pt-32 pb-16">
                <p className="text-sm text-muted-foreground mb-3">
                    <Link to="/tools" className="hover:text-foreground">Free SEO Tools</Link> / SERP Preview
                </p>
                <h1 className="text-3xl sm:text-5xl font-medium leading-tight mb-4 text-foreground">
                    Google SERP Preview & <span className="gradient-text dm-serif">Meta Length Checker</span>
                </h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    See how your title tag and meta description will look in Google search results. Lengths are measured in pixels, the way Google truncates them, on desktop and mobile.
                </p>

                <div className="space-y-4 mb-8">
                    <label className="block">
                        <span className="text-sm text-foreground">Title tag</span>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent" />
                    </label>
                    <Meter label="Title" chars={title.length} px={preview.titlePx} max={limits.title} ideal="50–60 chars" />
                    <label className="block">
                        <span className="text-sm text-foreground">Meta description</span>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent resize-none" />
                    </label>
                    <Meter label="Description" chars={description.length} px={preview.descPx} max={limits.description} ideal="120–160 chars" />
                    <label className="block">
                        <span className="text-sm text-foreground">Display URL</span>
                        <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent" />
                    </label>
                </div>

                <div className="flex gap-2 mb-3">
                    {(["desktop", "mobile"] as const).map((d) => (
                        <button key={d} onClick={() => setDevice(d)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border ${device === d ? "border-accent text-accent bg-accent/5" : "border-border text-muted-foreground"}`}>
                            {d === "desktop" ? <MonitorIcon size={14} /> : <SmartphoneIcon size={14} />}
                            {d === "desktop" ? "Desktop" : "Mobile"}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-border" style={{ maxWidth: device === "desktop" ? 680 : 400, fontFamily: "Arial, sans-serif" }}>
                    <p className="text-[12px] text-[#4d5156] truncate">{url}</p>
                    <p className="text-[#1a0dab] leading-snug mt-1" style={{ fontSize: device === "desktop" ? 20 : 18 }}>{preview.title.text}</p>
                    <p className="text-[14px] text-[#4d5156] leading-relaxed mt-1">{preview.description.text}</p>
                </div>
                {(preview.title.cut || preview.description.cut) && (
                    <p className="text-sm text-warning mt-3">{preview.title.cut ? "Your title will be cut off. " : ""}{preview.description.cut ? "Your description will be cut off." : ""}</p>
                )}

                <div className="mt-16 space-y-5">
                    <h2 className="text-2xl font-medium text-foreground">How long should a title and meta description be?</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Aim for 50–60 characters for titles and 120–160 for descriptions. Google actually truncates by pixel width — about 600px for desktop titles — so wide letters like "W" use up space faster than narrow ones like "i". This tool measures pixel width so you can see exactly where text gets cut.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Read the full guide: <Link to="/blog/meta-title-description-length" className="text-accent hover:underline">Meta title & description length</Link>. Want to check a live page? Use the{" "}
                        <Link to="/tools/meta-tag-checker" className="text-accent hover:underline">Meta Tag Checker</Link>.
                    </p>
                </div>
            </section>
            <Footer />
        </div>
    );
}
