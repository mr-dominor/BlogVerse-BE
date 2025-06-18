import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'

export const isAuthenticated = async(req, res, next) => {
    try {
        const token = req?.cookies?.jwt;
        console.log("middleware token is :", token)
        if (!token) {
            return res.status(400).json({
                success:false,
                message:"Token not recieved"
            }) 
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findById(decoded.userId)
        if (!user) {
            return res.status(400).json({
                success:false,
                message:"User not authenticated"
            }) 
        }
        req.user = user
        next();
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Middleware failed"
        })
    }
}

export const isAdmin = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(400).json({
                success:false,
                message:"User is not admin"
            })
        }
        next()
    }
}