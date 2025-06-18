import {User} from '../models/user.model.js'
import {v2 as cloudinary} from 'cloudinary'
import bcrypt from "bcrypt"
import createTokenAndSaveCookies from '../jwt/user.auth.js'
import mongoose from 'mongoose'

export const register = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: "Can't go ahead without image"
            })
        }
        const { photo } = req.files
        const allowed = ['image/jpeg','image/png','image/webp']

        if (!allowed.includes(photo.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Upload only jpg or png file"
            })
        }
        const {name, email, password, contact, role, education} = req.body

        if (!name || !email || !password || !contact || !role || !education) {
            return res.status(400).json({
                success: false,
                message: "Fill all deails"
            })
        }
        const preUser = await User.findOne({ email })
        

        if (preUser) {
            return res.json({
                message: "User already exists"
            })
        }

        const cloudResponse = await cloudinary.uploader.upload(photo.tempFilePath)

        if( !cloudResponse || cloudResponse.error) {
            return res.status(400).json({
                success: false,
                message: "Internal error, image not uploaded"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        console.log(cloudResponse)

        const newUser = new User({
            name,
            email,
            contact,
            password: hashedPassword,
            role,
            education,
            photo: {
                public_id: cloudResponse.public_id,
                url: cloudResponse.url
            }
        });
        await newUser.save();
        
        if (newUser) {
            try {
                let token = createTokenAndSaveCookies(newUser._id, res)
                console.log("Signup")
                return res.status(200).json({
                message:"User registered successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    education: newUser.education,
                    createdAt: newUser.createdAt,
                    
                },
                token:token,
            })
            } catch (error) {
               console.log('error') 
            }
            
        }
        console.log('hello world')

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Something went wrong wrong"
        })
    }
}
export const login =  async (req, res) => {
    const {email, password, role} = req.body
    try {
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All are required"
            })
        }
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not in Existence"
            })
        }
        const matchedPassword = bcrypt.compare(password, user.password)

        if (!matchedPassword) {
            return res.status(400).json({
                success: false,
                message: "Password is incorrect"
            })
        }
        if (user.role !== role) {
            return res.status(400).json({
                success: false,
                message: "Incorrect role"
            })
        }
        let token = await createTokenAndSaveCookies(user._id,res)
        console.log("Login")
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                _id: user._id,
                name: user.name
            },
            token:token,
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Something wrong, Login again"
        })
    }
}
export const logout = (req, res) => {
    try {
        res.clearCookie("jwt")
        res.status(200).json({message: "successfully logged out"})
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Something wrong"
        })
    }
}
export const getMyprofile = async(req, res) => {
    const user = await req.user
    console.log("In the getMyProfile",user)
    if(!user){
        return res.status(400).json({message:"Can't find your id"})
    }
    return res.status(200).json({
        success: true,
        user
    })
}
export const getAdmins = async(req, res) => {
    const admins = await User.find({role:"admin"});
    return res.status(200).json({admins})
}
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "No id in params" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, education } = req.body;

    let updatedData = {
      name,
      email,
      education,
    };

    if (req.files && req.files.adminPhoto) {
      const photo = req.files.adminPhoto;

      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(photo.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only JPG, PNG, and WEBP formats are allowed",
        });
      }

      const cloudResponse = await cloudinary.uploader.upload(photo.tempFilePath);
      if (!cloudResponse || cloudResponse.error) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload new photo",
        });
      }

      updatedData.photo = {
        public_id: cloudResponse.public_id,
        url: cloudResponse.secure_url,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });

    return res.status(200).json({
      success: true,
      message: "Successfully updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal issue, can't update your profile right now",
    });
  }
};
