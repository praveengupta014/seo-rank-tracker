import rankTracker from "./rankTrackerService.js";

export async function keywordTracking(tracking){
    try {
        let result;
        // Try up to 2 times for reliability
        for (let attempt = 1; attempt <= 2; attempt++){
            result = await rankTracker(tracking.keyword,tracking.domain)
            if (result.success && result.data.totalResultsScanned > 0) break;
            if (result.retryable === false) break;
            if(attempt < 2) await new Promise((r)=> setTimeout(r,result.success ? 3000:5000))
        }
        if(result.success && result.data.totalResultsScanned === 0){
            tracking.status = "failed";
            tracking.errorMessage = "No Google results could be read. Please try again later.";
        }else if(result.success){
            const prev = tracking.currentPosition;
            const today = new Date()
            today.setHours(0,0,0,0);
            tracking.currentPosition = result.data.position;
            tracking.currentPage = result.data.page;
            tracking.competitors = result.data.competitors
            tracking.lastChecked = new Date();
            tracking.status = "completed";
            tracking.errorMessage = null;
            
            //update stats
            tracking.positionChange = prev && result.data.position ? prev - result.data.position:0;
            if(result.data.position && (!tracking.bestPosition || result.data.position < tracking.bestPosition)){
                tracking.bestPosition = result.data.position;
            }

            // Update history
            const historyEntry ={
             date: today, position: result.data.position,
             page: result.data.page,
             title: result.data.title,
             snippet: result.data.snippet,
            
            }
            const idx = tracking.rankHistory.findIndex((h)=> new Date(h.date).toDateString() === today.toDateString());
            if(idx > -1) tracking.rankHistory[idx] = historyEntry;
            else tracking.rankHistory.push(historyEntry);
        }else{
            tracking.status = "failed";
            tracking.errorMessage = result.error || "Rank check failed. Please try again.";
        }
        await tracking.save();
        return result;

    } catch (error) {
        console.error("Rank update error:",error.message);
        tracking.status = "failed";
        tracking.errorMessage = "Rank check failed. Please try again.";
        await tracking.save().catch(() => {});
        return {success: false, error: error.message}
        
    }
}
export default keywordTracking;
// A check that stays "checking" this long was killed mid-run (e.g. serverless timeout)
const STALE_CHECK_MS = 6 * 60 * 1000;

export async function failStaleChecks(trackings){
    const now = Date.now();
    for (const tracking of trackings){
        if (tracking.status === "checking" && now - new Date(tracking.updatedAt).getTime() > STALE_CHECK_MS){
            tracking.status = "failed";
            tracking.errorMessage = "Rank check timed out. Please try again.";
            await tracking.save().catch(() => {});
        }
    }
}
