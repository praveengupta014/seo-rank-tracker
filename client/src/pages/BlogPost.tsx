import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { blogPosts, formatDate, getBlogPost } from "../content/blog";
import Footer from "../components/home/Footer";

export default function BlogPost() {
    const { slug = "" } = useParams();
    const post = getBlogPost(slug);
    if (!post) return <Navigate to="/blog" replace />;

    const related = blogPosts.filter((p) => p.slug !== post.slug);

    return (
        <div className="min-h-screen">
            <article className="max-w-3xl mx-auto px-4 pt-32 pb-16">
                <p className="text-sm text-muted-foreground mb-3">
                    <Link to="/blog" className="hover:text-foreground">Blog</Link> · {formatDate(post.date)} · {post.readMinutes} min read
                </p>
                <h1 className="text-3xl sm:text-4xl font-medium leading-tight mb-8 text-foreground">{post.title}</h1>
                <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.body }} />

                <div className="mt-12 bg-card border border-border rounded-2xl p-6 text-center">
                    <p className="text-foreground mb-2">Check your own page in seconds</p>
                    <p className="text-sm text-muted-foreground mb-4">Free on-page SEO score with clear fixes. No signup needed.</p>
                    <Link to="/tools/meta-tag-checker" className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 rounded-full text-sm" style={{ color: "var(--background)" }}>
                        Try the Meta Tag Checker <ArrowRightIcon size={14} />
                    </Link>
                </div>

                <div className="mt-12">
                    <h2 className="text-lg font-medium text-foreground mb-4">Keep reading</h2>
                    <ul className="space-y-2">
                        {related.map((p) => (
                            <li key={p.slug}>
                                <Link to={`/blog/${p.slug}`} className="text-accent hover:underline">{p.title}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </article>
            <Footer />
        </div>
    );
}
