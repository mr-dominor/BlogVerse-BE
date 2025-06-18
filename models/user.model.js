import mongoose from 'mongoose'
import validator from 'validator'
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, "Enter a valid email address"]
    },
    contact: {
        type: Number,
        required:true
    },
    password: {
        type:  String,
        requied: true,
        slelect: false,
        minlength: 8
    },
    role: {
        type: String,
        rquired: true,
        enum: ["admin","user"]
    },
    token: {
        type: String
    },
    education: {
        type: String,
        required: true
    },
    photo: {
        public_id:{
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
}, {timestamps:true})

export const User = mongoose.model("User",userSchema)