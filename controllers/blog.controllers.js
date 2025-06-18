import { Blog } from '../models/blog.model.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Create Blog
export const createBlog = async (req, res) => {
    try {
        if (!req.files || !req.files.blogPhoto) {
            return res.status(400).json({ success: false, message: "Blog image is required" });
        }

        const { title, category, about } = req.body;
        if (!title || !category || !about) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const blogPhoto = req.files.blogPhoto;
        const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedFormats.includes(blogPhoto.mimetype)) {
            return res.status(400).json({ success: false, message: "Invalid image format" });
        }

        const cloudinaryResponse = await cloudinary.uploader.upload(blogPhoto.tempFilePath);
        if (!cloudinaryResponse || cloudinaryResponse.error) {
            return res.status(500).json({ success: false, message: "Image upload failed" });
        }

        const newBlog = await Blog.create({
            title,
            category,
            about,
            createdBy: req.user._id,
            blogImage: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.url
            }
        });

        res.status(201).json({ success: true, message: "Blog created successfully", data: newBlog });

    } catch (error) {
        console.error("Blog creation error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get All Blogs (with admin details)
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('createdBy', 'name photo.url');
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch blogs" });
    }
};

// Get Single Blog (with admin details)
export const getSingleBlog = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID" });
    }

    try {
        const blog = await Blog.findById(id).populate('createdBy', 'name photo.url');

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        res.status(200).json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error retrieving blog" });
    }
};

// Get My Blogs
export const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ createdBy: req.user._id });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch your blogs" });
    }
};

// Update Blog
// Update Blog (with optional image update)
export const updateBlogs = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID" });
    }

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        const { title, category, about } = req.body;

        // Optional: Update blog photo if new one is uploaded
        if (req.files && req.files.blogPhoto) {
            const blogPhoto = req.files.blogPhoto;
            const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];

            if (!allowedFormats.includes(blogPhoto.mimetype)) {
                return res.status(400).json({ success: false, message: "Invalid image format" });
            }

            // Delete old image from Cloudinary
            if (blog.blogImage?.public_id) {
                await cloudinary.uploader.destroy(blog.blogImage.public_id);
            }

            // Upload new image
            const cloudinaryResponse = await cloudinary.uploader.upload(blogPhoto.tempFilePath);
            if (!cloudinaryResponse || cloudinaryResponse.error) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }

            blog.blogImage = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            };
        }

        // Update fields
        blog.title = title || blog.title;
        blog.category = category || blog.category;
        blog.about = about || blog.about;

        await blog.save();

        res.status(200).json({ success: true, message: "Blog updated successfully", blog });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};


// Delete Blog
export const deleteBlog = async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        await blog.deleteOne();
        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};
