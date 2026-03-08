import mongoose, { Schema, Document, Types } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";
import bcrypt from "bcryptjs";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: Types.ObjectId;
  status: "active" | "inactive";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ role: 1 });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.plugin(auditPlugin, {
  entityType: "User",
});

export const User = mongoose.model<UserDocument>("User", UserSchema);
