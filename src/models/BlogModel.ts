import mongoose, { Schema } from "mongoose";
import { blogSchem } from "../utils/interface";
import uniqueValidator from "mongoose-unique-validator"

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true

    },
    content: [{
        type: Schema.Types.ObjectId,
        ref: "Content"
    }],
    slug: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    } 
},
    {
    timestamps: true
    })

export const Blog = mongoose.model<blogSchem>('Blog', blogSchema);
blogSchema.plugin(uniqueValidator)
export default Blog;