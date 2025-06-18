import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  blogImage: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true,
    minlength: [50, "Must be at least 50 characters"]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

export const Blog = mongoose.model("Blog", blogSchema);
