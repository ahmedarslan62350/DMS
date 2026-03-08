import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "../plugins/Audit.plugin";
const CompanySchema = new Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    joiningDate: {
        type: Date,
        required: true,
    },
    dialerLink: {
        type: String,
        trim: true,
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
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});
CompanySchema.plugin(auditPlugin, {
    entityType: "Company",
});
export const Company = mongoose.model("Company", CompanySchema);
