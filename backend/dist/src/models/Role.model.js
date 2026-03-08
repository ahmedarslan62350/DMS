import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";
const RoleSchema = new Schema({
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
}, {
    timestamps: true,
});
RoleSchema.plugin(auditPlugin, {
    entityType: "Role",
});
export const Role = mongoose.model("Role", RoleSchema);
