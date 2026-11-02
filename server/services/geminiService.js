
import {GoogleGenAI,Type} from '@google/genai'

const seoAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.INTEGER },
        categories: {
            type: Type.OBJECT,
            properties: {
                seo: { type: Type.INTEGER },
                performance: { type: Type.INTEGER },
                accessibility: { type: Type.INTEGER },
                bestPractices: { type: Type.INTEGER },
            },
            required: ["seo", "performance", "accessibility", "bestPractices"],
        },
        keywords: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                    density: { type: Type.NUMBER },
                },
                required: ["word", "count", "density"],
            },
        },
        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    severity: {
                        type: Type.STRING,
                        format: "enum",
                        enum: ["critical", "warning", "info"],
                    },

                    category: { type: Type.STRING },
                    message: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                },
                required: ["severity", "category", "message", "recommendation"],
            },
        },
    },
    required: ["overallScore", "categories", "keywords", "issues"],
};

const CANDIDATE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemma-4-31b-it"
];

export async function analyzeSeoData(scrapedData){
    try {
        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in environment");
        }
        const ai = new GoogleGenAI({ apiKey });

        const title = scrapedData.metaData?.title || "";
        const description = scrapedData.metaData?.description || "";
        const h1Texts = scrapedData.headings?.h1Texts || [];

        // Prompt for getting SEO Analysis structured data from AI
        const prompt = `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.

Website URL: ${scrapedData.url || ""}
Load Time: ${scrapedData.loadTime || 0}ms
Status Code: ${scrapedData.statusCode || 200}
Page Size: ${Math.round((scrapedData.pageSize || 0) / 1024)}KB
Word Count: ${scrapedData.wordCount || 0}

META DATA:
- Title: "${title}" (${title.length} chars)
- Description: "${description}" (${description.length} chars)
- Canonical: "${scrapedData.metaData?.canonical || ""}"
- Robots: "${scrapedData.metaData?.robots || ""}"
- OG Title: "${scrapedData.metaData?.ogTitle || ""}"
- OG Description: "${scrapedData.metaData?.ogDescription || ""}"
- OG Image: "${scrapedData.metaData?.ogImage || ""}"
- Twitter Card: "${scrapedData.metaData?.twitterCard || ""}"
- Viewport: "${scrapedData.metaData?.viewport || ""}"
- Charset: "${scrapedData.metaData?.charset || ""}"

HEADINGS:
- H1: ${scrapedData.headings?.h1 || 0} (texts: ${JSON.stringify(h1Texts)})
- H2: ${scrapedData.headings?.h2 || 0}
- H3: ${scrapedData.headings?.h3 || 0}
- H4: ${scrapedData.headings?.h4 || 0}
- H5: ${scrapedData.headings?.h5 || 0}
- H6: ${scrapedData.headings?.h6 || 0}

LINKS:
- Internal: ${scrapedData.links?.internal || 0}
- External: ${scrapedData.links?.external || 0}
- Total: ${scrapedData.links?.total || 0}

IMAGES:
- Total: ${scrapedData.images?.total || 0}
- Missing Alt Text: ${scrapedData.images?.missingAlt || 0}
- With Alt Text: ${scrapedData.images?.withAlt || 0}

PAGE CONTENT (first 3000 chars):
${scrapedData.bodyText || ""}

Scoring guidelines:
- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s ok, >5s poor
- Page size: <3MB good
- Must have viewport meta, charset, canonical
- OG tags and Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages
- Check heading hierarchy

Severity levels must be exactly one of: "critical", "warning", or "info".
Provide 5-15 issues sorted by severity (critical first). Be specific and actionable with recommendations.
Extract top 10 keywords by frequency from the page content.`;

        let analysis = null;
        let lastError = null;

        for (const model of CANDIDATE_MODELS) {
            // Retry 500/503/429 (overloaded) a couple of times before moving to the next model
            for (let attempt = 1; attempt <= 2 && !analysis; attempt++) {
                try {
                    const response = await ai.models.generateContent({
                        model,
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: seoAnalysisSchema,
                        }
                    });
                    if (response?.text) {
                        analysis = JSON.parse(response.text);
                    }
                } catch (err) {
                    lastError = err;
                    const transient = /\b(500|503|429)\b|UNAVAILABLE|INTERNAL|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(err.message);
                    console.warn(`[GEMINI] Model ${model} attempt ${attempt} failed (${err.message})`);
                    if (!transient) break;
                    await new Promise((r) => setTimeout(r, 1500 * attempt));
                }
            }
            if (analysis) break;
        }

        if (!analysis) {
            throw lastError || new Error("All AI models failed to generate content");
        }

        return { success: true, data: analysis };
    } catch (error) {
        console.error("Gemini analysis error:", error.message);
        return { success: false, error: error.message };
    }
}
export default analyzeSeoData;


