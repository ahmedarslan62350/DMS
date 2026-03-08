import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";
const PermissionSchema = new Schema({
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
}, {
    timestamps: true,
});
PermissionSchema.plugin(auditPlugin, {
    entityType: "Permission",
});
export const Permission = mongoose.model("Permission", PermissionSchema);
