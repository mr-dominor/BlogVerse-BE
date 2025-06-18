import express from "express";
import mongoose from "mongoose"
import dotenv from "dotenv";
import {v2 as cloudinarry} from "cloudinary";
import userRouter from "./routers/user.router.js"
import fileUpload from "express-fileupload";
import blogRouter from "./routers/blog.router.js"
import cookieParser from "cookie-parser";
import cors from 'cors'

dotenv.config()
const app = express()
app.use(express.json())
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONT_END_URL,
        credentials:true,
        methods: ["GET","POST","PUT","DELETE"]
    })
)


try {
    mongoose.connect(process.env.DATABASE_CONNECTION)
    console.log(`database connected`)
} catch (error) {
    console.log(error)
}

cloudinarry.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir:"/tmp/",
    })
)

app.use("/api/users",userRouter)
app.use("/api/blog", blogRouter )

app.listen(process.env.PORT,'0.0.0.0', ()=>{
    console.log(`Listening`)
})