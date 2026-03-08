import mongoose, { Schema } from "mongoose";
const AuditLogSchema = new Schema({
    entityType: {
        type: String,
        required: true,
        enum: ["User", "Company", "Permission", "Role"],
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "entityType",
    },
    field: {
        type: String,
        required: true,
    },
    oldValue: {
        type: Schema.Types.Mixed,
    },
    newValue: {
        type: Schema.Types.Mixed,
    },
    action: {
        type: String,
        enum: ["create", "update", "delete"],
        required: true,
    },
    changedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false,
    },
});
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ createdAt: -1 });
export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
