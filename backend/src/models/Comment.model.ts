import mongoose, { Schema, Document, Types } from "mongoose";

export interface CommentDocument extends Document {
  companyId: Types.ObjectId;
  comment: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

const CommentSchema = new Schema<CommentDocument>(
  {
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
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ companyId: 1 });
CommentSchema.index({ createdAt: -1 });

export const Comment = mongoose.model<CommentDocument>(
  "Comment",
  CommentSchema
);