import express from "express"
import {register, login, logout, getMyprofile, getAdmins, updateProfile} from "../controllers/user.controllers.js"
import { isAuthenticated } from "../middleware/userAuth.js"

const router = express.Router()

router.post("/register", register)
router.post("/login",login)
router.get("/logout",isAuthenticated, logout)
router.get("/my-profile",isAuthenticated, getMyprofile)
router.get("/admins", getAdmins)
router.put("/update-profile/:id", updateProfile)
export default router