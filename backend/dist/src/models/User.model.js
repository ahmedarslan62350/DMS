import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";
import bcrypt from "bcryptjs";
const UserSchema = new Schema({
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
}, {
    timestamps: true,
});
UserSchema.index({ role: 1 });
UserSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    this.password = await bcrypt.hash(this.password, 10);
});
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
UserSchema.plugin(auditPlugin, {
    entityType: "User",
});
export const User = mongoose.model("User", UserSchema);
