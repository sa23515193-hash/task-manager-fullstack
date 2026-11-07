import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import { notFound, errorHandler } from './middleware/errors.js'
import { readStore } from './services/store.js'
const app=express()
app.use(helmet())
app.use(cors({origin:process.env.CLIENT_ORIGIN?.split(',')||'http://localhost:5173'}))
app.use(express.json({limit:'1mb'}))
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:100,standardHeaders:true,legacyHeaders:false}))
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'TaskFlow API',time:new Date().toISOString()}))
app.use('/api/auth',authRoutes)
app.use('/api/tasks',taskRoutes)
app.use(notFound)
app.use(errorHandler)
const port=process.env.PORT||5000
readStore().then(()=>app.listen(port,()=>console.log(`TaskFlow API listening on http://localhost:${port}`))).catch(err=>{console.error('Unable to initialize JSON store',err);process.exit(1)})
