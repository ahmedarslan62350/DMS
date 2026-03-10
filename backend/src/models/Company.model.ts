import mongoose, { Schema, Document, Types } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";

export interface CompanyDocument extends Document {
  companyName: string;
  joiningDate: Date;
  dialerLink?: string;
  password?: string;
  noOfServers: number;
  serverCharges: number;
  renewalDate: Date;
  status: "active" | "inactive";
  comment?: string;
  additionalComment?: string;
  inactiveDate?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<CompanyDocument>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },
    inactiveDate: {
      type: Date,
    },
    dialerLink: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },

    noOfServers: {
      type: Number,
      required: true,
      min: 0,
    },

    serverCharges: {
      type: Number,
      required: true,
      min: 0,
    },

    renewalDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    comment: {
      type: String,
      default: "",
    },
    additionalComment: {
      type: String,
      default: "",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

CompanySchema.index({ renewalDate: 1 });
CompanySchema.plugin(auditPlugin, {
  entityType: "Company",
});

export const Company = mongoose.model<CompanyDocument>(
  "Company",
  CompanySchema,
);
