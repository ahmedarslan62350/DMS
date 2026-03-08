import mongoose, { Schema, Document, Types } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";

export interface RoleDocument extends Document {
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

RoleSchema.plugin(auditPlugin, {
  entityType: "Role",
});

export const Role = mongoose.model<RoleDocument>("Role", RoleSchema);