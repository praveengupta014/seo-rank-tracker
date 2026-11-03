import { Link } from "react-router-dom";
import { blogPosts, formatDate } from "../content/blog";
import Footer from "../components/home/Footer";

export default function Blog() {
    return (
        <div className="min-h-screen">
            <section className="max-w-3xl mx-auto px-4 pt-32 pb-20">
                <h1 className="text-3xl sm:text-5xl font-medium leading-tight mb-4 text-foreground">
                    The RankPilot <span className="gradient-text dm-serif">SEO Blog</span>
                </h1>
                <p className="text-muted-foreground mb-12">Practical guides to help your pages rank higher — no fluff.</p>
                <div className="space-y-5">
                    {blogPosts.map((post) => (
                        <article key={post.slug} className="bg-card border border-border rounded-2xl p-6 hover:bg-muted/30 transition-all">
                            <p className="text-xs text-muted-foreground mb-2">
                                {formatDate(post.date)} · {post.readMinutes} min read
                            </p>
                            <h2 className="text-xl font-medium text-foreground mb-2">
                                <Link to={`/blog/${post.slug}`} className="hover:text-accent">{post.title}</Link>
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
                        </article>
                    ))}
                </div>
            </section>
            <Footer />
        </div>
    );
}
