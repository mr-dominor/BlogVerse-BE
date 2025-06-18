import express from 'express'
import {createBlog, deleteBlog, getAllBlogs, getSingleBlog, getMyBlogs, updateBlogs} from '../controllers/blog.controllers.js'
import { isAdmin, isAuthenticated } from '../middleware/userAuth.js'
const router = express.Router()

router.post("/create-blog",isAuthenticated, isAdmin("admin"), createBlog)
router.delete("/delete-blog/:id", isAuthenticated, isAdmin("admin"), deleteBlog)
router.get("/get-all-blogs", getAllBlogs)
router.get("/get-single-blog/:id",isAuthenticated, getSingleBlog)
router.get("/get-my-blog",isAuthenticated,isAdmin("admin"), getMyBlogs)
router.put("/update-blog/:id",isAuthenticated,isAdmin("admin") , updateBlogs)

export default router