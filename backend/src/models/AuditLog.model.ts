import mongoose, { Schema, Document, Types } from "mongoose";

export interface AuditLogDocument extends Document {
  entityType: string;
  entityId: Types.ObjectId;
  field: string;
  oldValue?: any;
  newValue?: any;
  action: "create" | "update" | "delete";
  changedBy: Types.ObjectId;
  createdAt: Date;
}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
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
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<AuditLogDocument>(
  "AuditLog",
  AuditLogSchema,
);
