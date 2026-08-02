import KeywordTracking from "../model/keywordTracking.js";
import { keywordTracking } from "../services/keywordTrackingService.js";


// Add keyword to track
export const addKeyword = async (req, res) => {
try{
const {keyword,url} = req.body

if(!keyword || ! url) return res.status(400).json({success: false, message:"Keyword and URL are required"});

//Extract url from domain
let domain;
try{
const urlObj = new URL(url.startsWith("http")? url : `http://${url}`);
domain = urlObj.hostname.replace("www."," ")
        }catch(error){
return res.status(400).json({success: false, message:"Invalid URL format"});

        }
//check if already tracking this keyword+domain
const existing = await KeywordTracking.findOne({userId:req.userId, keyword:keyword.toLowerCase().trim(),domain});

if(existing){
return res.status(400).json({success: false, message:"Keyword already being tracked for this domain"});
        }
// Create tracking entery 
const tracking = await KeywordTracking.create({
userId:req.userId,
keyword: keyword.toLowerCase().trim(),
url:url.startsWith("http") ? url :`https://${url}`,
domain,
status:"checking"
        })

res.status(201).json({success: true, message: "keyword tracking started", tracking });
keywordTracking(tracking)



    } catch(error){
console.error("Add keyword error:", error.message);
if (error. code === 17000) return res. status (400). json({ success: false, message: "Already tracking this keyword"});
res. status (500). json({ success: false, message: "Server error"}) 


    }

}

// Get tracked all keyword for user
export const getKeywords = async (req, res) => {
try {
const keywords = await KeywordTracking.find({userId:req.userId}).sort({createdAt: -1}).
select("-rankHistory")
res. json({success: true, keywords });
    } catch (error) {
console.error ("Get keywords error:", error. message);
res. status (500). json({ success: false, message: "Server error" }) ;
    }

}
// get single keyword with full history

export const getKeyword = async (req, res) => {
    try {
        const keywords = await KeywordTracking.findOne({_id:req.params.id,userId: req.userId});
        if(!keywords) return res.status(404).json({success: false, message: "Keyword tracking not found"});
        res.json({success: true, tracking: keywords });
    } catch (error) {
        console.error("Get keywords error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
// manuall keyword tracking
export const refreshKeyword = async (req, res) => {
try {
const keywords = await KeywordTracking.findOne({_id:req.params.id,userId: req.userId});
if(!keywords) return res. status(404). json({success: false, message: "Keyword tracking not found"});
keywords.status = "checking";
await keywords.save();
res. json({success: true, message:"Rank check satrted" });
    } catch (error) {
console.error ("Get keywords error:", error. message);
res. status (500). json({ success: false, message: "Server error" }) ;
    }

}
// delete keyword tracking
export const deleteKeyword = async (req, res) => {
    try {
    const tracking = await KeywordTracking.findByIdAndDelete({_id: req.params.id, userId: req.userId});
    if(!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
    res.json({ success: true, message: "Keyword tracking deleted" });
}
catch (error) {
    console.error("Delete keyword error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
}

}
// Toggle tracking active /inactive
export const toggleTracking = async (req, res) => {
    try {
    const tracking = await KeywordTracking.findOne({_id: req.params.id, userId: req.userId});
    if(!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
    tracking.active = !tracking.active;
    await tracking.save();
    res.json({ success: true, tracking });
}
catch (error) {
    console.error("Toggle tracking keyword error:",error.message);
    res.status(500).json({ success: false, message: "Server error" });
}

}