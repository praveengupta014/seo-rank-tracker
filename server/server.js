import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import authRouter from './route/authRoute.js';
import rankRouter from './route/rankRoute.js';
import analysisRouter from './route/analysisRoutes.js';
import { startRankTrackingCron } from './cron/rankTrackingCron.js';




connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/',(req,res) => res.send('server is running'))
app.use('/api/auth',authRouter)
app.use('/api/rank',rankRouter)
app.use('/api/analysis',analysisRouter)
 
// start crons jobs 
startRankTrackingCron()

const PORT = process.env.PORT || 5000

app.listen(PORT,() =>  console.log(`server is running on port ${PORT}`))