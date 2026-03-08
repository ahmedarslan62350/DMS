import mongoose, { Schema } from "mongoose";
const CommentSchema = new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
CommentSchema.index({ companyId: 1 });
CommentSchema.index({ createdAt: -1 });
export const Comment = mongoose.model("Comment", CommentSchema);
