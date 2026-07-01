import mongoose, { Schema, Document, Types } from "mongoose";

export interface MonthlyChargesDocument extends Document {
  month: string; // Format: "YYYY-MM" (e.g., "2024-01")
  year: number;
  monthNumber: number;
  totalCharges: number;
  totalPaid: number;
  totalPending: number;
  companyPayments: Array<{
    companyId: Types.ObjectId;
    companyName: string;
    charges: number;
    paid: number;
    pending: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyChargesSchema = new Schema<MonthlyChargesDocument>(
  {
    month: {
      type: String,
      required: true,
      unique: true,
    },
    year: {
      type: Number,
      required: true,
    },
    monthNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    totalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPending: {
      type: Number,
      default: 0,
      min: 0,
    },
    companyPayments: [
      {
        companyId: {
          type: Schema.Types.ObjectId,
          ref: "Company",
          required: true,
        },
        companyName: {
          type: String,
          required: true,
        },
        charges: {
          type: Number,
          required: true,
          min: 0,
        },
        paid: {
          type: Number,
          default: 0,
          min: 0,
        },
        pending: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

MonthlyChargesSchema.index({ month: 1 });
MonthlyChargesSchema.index({ year: 1, monthNumber: 1 });

export const MonthlyCharges = mongoose.model<MonthlyChargesDocument>(
  "MonthlyCharges",
  MonthlyChargesSchema,
);
