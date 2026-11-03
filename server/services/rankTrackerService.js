// Finds where a domain ranks on Google for a keyword using the Serper.dev SERP API.
// (Scraping Google directly through a headless browser gets blocked by CAPTCHAs.)

const SERPER_URL = "https://google.serper.dev/search";
const MAX_PAGES = 5; // top 50 results, 1 Serper credit per page

const searchPage = async (keyword, page) => {
  const res = await fetch(SERPER_URL, {
    method: "POST",
    headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: keyword, gl: "us", hl: "en", num: 10, page }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Serper request failed (${res.status})`);
    // 400 bad request, 401/403 bad key, 429 out of credits / rate limited: retrying won't help
    error.retryable = ![400, 401, 403, 429].includes(res.status);
    throw error;
  }
  return data.organic || [];
};

export async function rankTracker(keyword, targetDomain){
  if (!process.env.SERPER_API_KEY) {
    return { success: false, retryable: false, error: "Rank tracking is not configured (SERPER_API_KEY missing)." };
  }

  // trim() also cleans domains saved by the old buggy replace("www."," ")
  const cleanTarget = targetDomain.trim().toLowerCase().replace(/^www\./,"");
  // Exact domain or its subdomain (blog.example.com matches example.com, notexample.com does not)
  const isTarget = (domain) => domain === cleanTarget || domain.endsWith(`.${cleanTarget}`);

  try {
    let found = null;
    const allResults = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const organic = await searchPage(keyword, page);
      if (!organic.length) break;

      for (const r of organic) {
        let domain;
        try {
          domain = new URL(r.link).hostname.toLowerCase().replace(/^www\./, "");
        } catch {
          continue;
        }
        const result = { url: r.link, domain, title: r.title || "", snippet: (r.snippet || "").substring(0, 300), position: allResults.length + 1 };
        allResults.push(result);
        if (!found && isTarget(domain)) found = { ...result, page };
      }
      if (found) break;
    }

    const competitors = allResults.filter((r) => !isTarget(r.domain)).slice(0, 10);

    return {
      success: true,
      data: {
        keyword,
        targetDomain,
        position: found?.position || null,
        page: found?.page || null,
        title: found?.title || "",
        snippet: found?.snippet || "",
        competitors,
        totalResultsScanned: allResults.length,
      },
    };
  } catch (error) {
    console.error("Rank check error:", error.message);
    const message = error.name === "TimeoutError" ? "Search request timed out. Please try again." : error.message;
    return { success: false, retryable: error.retryable !== false, error: message };
  }
}

export default rankTracker;
