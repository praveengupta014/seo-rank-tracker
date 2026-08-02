import mongoose from "mongoose";

const rankEnterySchema = new mongoose.Schema({
    date: { type:Date, required: true},
    position :{ type: Number, required:null},
    page: {type: Number, required:null},
    title: {type: String, default:" "},
    snippet:{type: String, default:" "},

},{id:false})

const competitorsSchema = new mongoose.Schema({
     position :{ type: Number, required:null},
     url:{type: String, required: true,trim: true},
     domain:{type:String,required:true},
     title: {type: String, default:" "},
     snippet:{type: String, default:" "},


})
const keywordTrackingschema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId,ref: "User",required:true},
    keyword:{type: String, required: true,trim: true, lowercase: true},
    url:{type: String, required: true,trim: true},
    domain:{type:String,required:true},
    currentPosition:{type: Number, default:null},
    currentPage:{type: Number, default:null},
    bestPosition:{ type: Number, default:null },
    positionChange: {type: Number, default:0},
    rankHistory:[],
    competitors:[competitorsSchema ],
    active:{type: Boolean, default:true},
    lastChecked:{type:Date,default:null},
    status:{type:String, enum:["pending", "checking", "completed" ,"failed"],default:"pending"},
    
},{timestamps:true})

keywordTrackingschema.index({userId:1,keyword:1,domain:1},{unique:true})

const KeywordTracking = mongoose.model("KeywordTracking", keywordTrackingschema)

export default KeywordTracking;