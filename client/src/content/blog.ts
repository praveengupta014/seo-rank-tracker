// Blog posts. `body` is trusted, hand-written HTML rendered on /blog/:slug.

export type BlogPost = {
    slug: string;
    title: string;
    description: string;
    date: string;
    updated?: string;
    readMinutes: number;
    body: string;
};

export const blogPosts: BlogPost[] = [
    {
        slug: "how-to-improve-seo-score",
        title: "How to Improve Your SEO Score: 12 Fixes That Actually Move Rankings",
        description: "A prioritized checklist to raise your SEO score: fix indexing, titles, meta descriptions, headings, speed, and content — in the order that matters most.",
        date: "2026-11-03",
        readMinutes: 8,
        body: `
<p>An "SEO score" from any audit tool is a proxy, not a ranking factor. Google never sees it. What it does is bundle dozens of checks that <em>do</em> affect how easily search engines crawl, understand, and rank your pages. So the goal is not to hit 100 — it's to fix the issues behind the score in the order that has the biggest impact.</p>
<p>Here's the order we recommend, from "your page can't rank at all" to "polish".</p>

<h2>1. Make sure the page can be indexed</h2>
<p>Nothing else matters if Google is told to stay away. Check three places:</p>
<ul>
  <li><strong>Robots meta tag</strong> — <code>&lt;meta name="robots" content="noindex"&gt;</code> removes the page from search. Staging settings often leak into production.</li>
  <li><strong>X-Robots-Tag header</strong> — the same instruction can be sent as an HTTP header, where it's easy to miss.</li>
  <li><strong>robots.txt</strong> — a <code>Disallow</code> rule stops crawling. It doesn't remove pages already indexed, but it blocks Google from seeing updates.</li>
</ul>
<p>Our free <a href="/tools/meta-tag-checker">Meta Tag Checker</a> flags noindex in both the tag and the header.</p>

<h2>2. Make sure crawlers can see your content</h2>
<p>If your site is a JavaScript single-page app, the raw HTML may be an empty <code>&lt;div id="root"&gt;</code>. Google can render JavaScript, but it does so later and with limits, and most AI crawlers (the ones feeding ChatGPT, Perplexity and similar tools) don't run JavaScript at all. Prerendering or server-side rendering your public pages fixes this. A quick test: open <em>View Source</em> — if you can't read your headline there, neither can many bots.</p>

<h2>3. Write a unique, specific title tag</h2>
<p>The title is still the strongest on-page signal you control. Keep it around 50–60 characters, put the main keyword near the start, and make every page's title unique. "Home" or your brand name alone wastes the slot.</p>
<p>Not sure how it looks in results? Paste it into the <a href="/tools/serp-preview">SERP Preview tool</a>.</p>

<h2>4. Write a meta description that earns the click</h2>
<p>Descriptions don't directly affect rankings, but they affect click-through rate — and Google often uses your text when it matches the query. Aim for 120–160 characters: say what the page offers, include the keyword naturally, and give a reason to click. See our guide on <a href="/blog/meta-title-description-length">meta title and description length</a>.</p>

<h2>5. Use one clear H1 and a logical heading structure</h2>
<p>One H1 that matches the page's intent, then H2s for main sections and H3s beneath them. Headings help both readers who skim and search engines that use them to understand topic structure.</p>

<h2>6. Set a canonical URL</h2>
<p>The same page often lives at several URLs — with and without <code>www</code>, trailing slashes, tracking parameters. A <code>rel="canonical"</code> tag tells Google which version to rank, so ranking signals aren't split across duplicates.</p>

<h2>7. Fix page speed where it's worst</h2>
<p>Core Web Vitals are a lightweight ranking factor but a heavy user-experience factor. The usual big wins:</p>
<ul>
  <li>Serve images in WebP or AVIF, sized to how they're displayed.</li>
  <li>Lazy-load images below the fold.</li>
  <li>Cut unused JavaScript and defer third-party scripts (chat widgets, trackers).</li>
  <li>Reserve space for images and embeds so the layout doesn't shift while loading.</li>
</ul>

<h2>8. Make it work on mobile</h2>
<p>Google indexes the mobile version of your site. You need a viewport meta tag, readable font sizes without zooming, and tap targets that aren't crammed together.</p>

<h2>9. Add alt text to meaningful images</h2>
<p>Alt text helps screen-reader users and gives image search something to index. Describe what the image shows in plain words; don't stuff keywords. Purely decorative images can use an empty <code>alt=""</code>.</p>

<h2>10. Add structured data</h2>
<p>JSON-LD schema (Organization, Product, Article, FAQ, and so on) helps search engines understand entities on the page and can unlock rich results like star ratings or breadcrumbs.</p>

<h2>11. Add Open Graph tags</h2>
<p>Not a ranking factor, but <code>og:title</code>, <code>og:description</code> and <code>og:image</code> decide how your link looks when shared on LinkedIn, WhatsApp, X or Slack. Better-looking shares get more clicks, and more visitors means more chances to earn links.</p>

<h2>12. Improve the content itself</h2>
<p>Technical fixes remove barriers; content is what ranks. Pages that win usually answer the searcher's question faster and more completely than competitors, include something original (data, examples, screenshots, experience), and link to related pages on your own site.</p>

<h2>How to check your progress</h2>
<p>Run your page through the <a href="/tools/meta-tag-checker">free Meta Tag Checker</a> for a quick on-page score, or <a href="/register">create a free RankPilot account</a> for a full AI-powered audit with performance, accessibility and content recommendations. Then track the keywords you care about over time — rankings, not scores, are the real result.</p>
`,
    },
    {
        slug: "meta-title-description-length",
        title: "Meta Title & Description Length: Ideal Character Counts (and Why Pixels Matter)",
        description: "How long should your title tag and meta description be? Recommended character ranges, why Google truncates by pixel width, and how to write snippets that get clicks.",
        date: "2026-11-03",
        readMinutes: 6,
        body: `
<p>Every page competes for attention in the search results with two lines of text: the title and the description. Get the length wrong and Google cuts your message mid-sentence. Here's what to aim for.</p>

<h2>The short answer</h2>
<ul>
  <li><strong>Title tag:</strong> 50–60 characters</li>
  <li><strong>Meta description:</strong> 120–160 characters</li>
</ul>
<p>These are safe ranges, not hard rules. The real limit is pixel width, which is why some 60-character titles get cut and some 65-character ones don't.</p>

<h2>Why Google truncates by pixels, not characters</h2>
<p>Search results have a fixed width. A title made of wide letters like "W" and "M" fills the space faster than one made of narrow letters like "i" and "l". On desktop, titles are cut at roughly 600 pixels; descriptions get roughly two lines of space and are trimmed with an ellipsis (…) after that. On mobile the space is narrower, so descriptions often show fewer characters.</p>
<p>The practical takeaway: write within the character ranges above, then check visually. Our <a href="/tools/serp-preview">SERP Preview tool</a> measures pixel width the way the results page does and warns you before text gets cut.</p>

<h2>Google may rewrite your title or description</h2>
<p>Google rewrites titles when it thinks they don't describe the page well — for example when they're stuffed with keywords, too long, or identical across many pages. Descriptions are rewritten even more often, usually when a passage on the page matches the query better. You can't fully prevent it, but you can make it less likely:</p>
<ul>
  <li>Make the title an accurate summary of the page, not a list of keywords.</li>
  <li>Keep the title consistent with the page's H1.</li>
  <li>Write a unique description for every important page.</li>
</ul>

<h2>How to write a title that gets clicks</h2>
<ol>
  <li><strong>Lead with the main keyword or topic.</strong> Searchers scan the first few words.</li>
  <li><strong>Add a specific benefit or detail.</strong> "Free", a number, the current year, or a format ("checklist", "template") makes it concrete.</li>
  <li><strong>Put your brand at the end</strong>, separated by a dash or pipe — or drop it on long titles.</li>
</ol>
<p>Example: <em>Free Meta Tag Checker — Instant On-Page SEO Score | RankPilot</em></p>

<h2>How to write a description that gets clicks</h2>
<ul>
  <li>Answer "what will I get on this page?" in the first sentence.</li>
  <li>Include the keyword naturally — Google bolds words that match the query.</li>
  <li>End with a reason to click: no signup needed, step-by-step, takes 2 minutes.</li>
  <li>Avoid quotes in the meta tag; they can cut the description short in some setups.</li>
</ul>

<h2>Common mistakes</h2>
<ul>
  <li><strong>Same title on every page</strong> — common in JavaScript apps that only set the title once in <code>index.html</code>.</li>
  <li><strong>Missing descriptions</strong> — Google will pick random text from the page, often navigation or cookie banners.</li>
  <li><strong>Keyword stuffing</strong> — "SEO Tool, Best SEO Tool, Free SEO Tool" gets rewritten and looks spammy.</li>
</ul>

<h2>Check your pages</h2>
<p>Enter any URL into the <a href="/tools/meta-tag-checker">Meta Tag Checker</a> to see your current title and description lengths along with other on-page issues. For a broader checklist, read <a href="/blog/how-to-improve-seo-score">how to improve your SEO score</a>.</p>
`,
    },
    {
        slug: "how-to-track-keyword-rankings",
        title: "How to Track Keyword Rankings on Google (Free and Automated Methods)",
        description: "Learn how to track where your website ranks on Google for any keyword — using Search Console, manual checks, and automated rank trackers — and what to do with the data.",
        date: "2026-11-03",
        readMinutes: 7,
        body: `
<p>You can't improve what you don't measure. Tracking keyword rankings tells you whether your SEO work is paying off, which pages are slipping, and where a small push could move you onto page one. Here are three ways to do it, from free and manual to fully automated.</p>

<h2>Method 1: Google Search Console (free)</h2>
<p>Search Console shows the queries your site already appears for, with clicks, impressions, click-through rate and <strong>average position</strong>.</p>
<ol>
  <li>Verify your site in Google Search Console.</li>
  <li>Open <strong>Performance → Search results</strong>.</li>
  <li>Enable the <strong>Average position</strong> metric and open the <strong>Queries</strong> tab.</li>
  <li>Filter by a query or page to see its trend over time.</li>
</ol>
<p><strong>Limits:</strong> "average position" blends every location, device and day, so it rarely matches what you see when you search yourself. It only shows keywords you already get impressions for, and data appears with a delay of a couple of days.</p>

<h2>Method 2: Manual searches (free, but misleading)</h2>
<p>Searching your keyword and scrolling to find your site feels direct, but your results are personalized by location, search history and device. If you do it, use a private window, sign out, and remember the result is one data point, not your "real" ranking.</p>

<h2>Method 3: An automated rank tracker</h2>
<p>A rank tracker checks a fixed list of keywords on a schedule from a consistent, non-personalized setup and records the exact position each time. That gives you:</p>
<ul>
  <li>A daily position history for each keyword, so you can spot trends and drops early.</li>
  <li>Tracking for keywords you don't rank for <em>yet</em> — Search Console can't show these.</li>
  <li>The exact URL that ranks, which reveals when the wrong page is competing for a keyword.</li>
</ul>
<p>RankPilot's <a href="/register">free rank tracker</a> checks your keywords automatically and charts the position history, alongside AI-powered SEO audits of your pages.</p>

<h2>Which keywords should you track?</h2>
<ul>
  <li><strong>Money keywords</strong> — terms that describe what you sell ("3D product rendering service", "SEO audit tool").</li>
  <li><strong>Striking-distance keywords</strong> — queries where you rank in positions 8–20. In Search Console, sort queries by position and look for those with good impressions. Small improvements here bring the fastest traffic gains.</li>
  <li><strong>Brand keywords</strong> — your name, to make sure you own your own results.</li>
  <li><strong>One or two competitor-defining terms</strong> — to see how you stack up for the core topic.</li>
</ul>
<p>Start with 10–20 keywords. A focused list you check every week beats 500 keywords you never look at.</p>

<h2>What to do when a ranking drops</h2>
<ol>
  <li><strong>Check if it's real.</strong> One-day swings are normal. Look at the trend over a week.</li>
  <li><strong>Check the page still works.</strong> Is it indexable? Did the title, content or URL change? Run it through the <a href="/tools/meta-tag-checker">Meta Tag Checker</a>.</li>
  <li><strong>Look at who replaced you.</strong> Search the keyword and compare the top results to your page — are they more complete, more recent, or a different format?</li>
  <li><strong>Check for a Google update.</strong> If many keywords drop at once, it's usually an algorithm change, not something on your page.</li>
</ol>

<h2>Turn ranking data into action</h2>
<p>Rankings are a scoreboard. The work happens on the page: better titles, more helpful content, internal links from related pages, and fixing technical issues. Our guide on <a href="/blog/how-to-improve-seo-score">improving your SEO score</a> covers the fixes in priority order.</p>
`,
    },
];

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);

export const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
