import { Link } from "react-router-dom";
import { FileSearchIcon, EyeIcon, TargetIcon, ArrowRightIcon } from "lucide-react";
import Footer from "../../components/home/Footer";

const tools = [
    { to: "/tools/meta-tag-checker", icon: <FileSearchIcon size={22} />, title: "Meta Tag Checker", desc: "Check any page's title, description, canonical, Open Graph and H1 tags, and get an instant on-page SEO score." },
    { to: "/tools/serp-preview", icon: <EyeIcon size={22} />, title: "SERP Preview", desc: "Preview how your title and meta description look in Google on desktop and mobile, measured in pixels." },
    { to: "/register", icon: <TargetIcon size={22} />, title: "Keyword Rank Tracker", desc: "Track where your site ranks on Google for your keywords, with daily position history. Free account required." },
];

export default function Tools() {
    return (
        <div className="min-h-screen">
            <section className="max-w-5xl mx-auto px-4 pt-32 pb-20">
                <h1 className="text-3xl sm:text-5xl font-medium leading-tight mb-4 text-foreground text-center">
                    Free <span className="gradient-text dm-serif">SEO Tools</span>
                </h1>
                <p className="text-muted-foreground mb-12 text-center max-w-xl mx-auto">Quick, free tools to check and improve your on-page SEO. No signup needed.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {tools.map((tool) => (
                        <Link key={tool.to} to={tool.to} className="bg-card border border-border rounded-2xl p-6 hover:bg-muted/30 transition-all group">
                            <div className="text-primary mb-4">{tool.icon}</div>
                            <h2 className="text-lg font-medium mb-2 text-foreground">{tool.title}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{tool.desc}</p>
                            <span className="text-sm text-accent inline-flex items-center gap-1">
                                Open tool <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
            <Footer />
        </div>
    );
}
