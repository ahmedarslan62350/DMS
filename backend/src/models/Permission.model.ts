import mongoose, { Schema, Document } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";

export interface PermissionDocument extends Document {
  key: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<PermissionDocument>(
  {
    key: {
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
  },
  {
    timestamps: true,
  }
);

PermissionSchema.plugin(auditPlugin, {
  entityType: "Permission",
});


export const Permission = mongoose.model<PermissionDocument>(
  "Permission",
  PermissionSchema
);