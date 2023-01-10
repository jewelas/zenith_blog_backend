import mongoose, { Schema } from "mongoose";
import { contentSchema } from "../utils/interface";

const contentSchema = new mongoose.Schema({
    headers: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true

    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
},
    {
        timestamps: true
    })

export const Content = mongoose.model<contentSchema>('Content', contentSchema);

export default Content;