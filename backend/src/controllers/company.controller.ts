import { Request, Response } from "express";
import { Company } from "../models/Company.model";
import { User } from "../models/User.model";
import {
  updateMonthlyCharges,
  recalculateMonthlyCharges,
  removeCompanyFromMonthlyCharges,
} from "./monthlyCharges.controller";

export const createCompany = async (req: any, res: Response) => {
  try {
    const {
      companyName,
      joiningDate,
      dialerLink,
      password,
      noOfServers,
      serverCharges,
      renewalDate,
      comment,
      additionalComment,
      paidAmount,
    } = req.body;

    const greatestIntId = await Company.findOne().sort({ intId: -1 }).select("intId");
    const intId = greatestIntId ? greatestIntId.intId + 1 : 1;

    const company = new Company({
      companyName,
      joiningDate,
      dialerLink,
      password,
      noOfServers,
      serverCharges,
      renewalDate,
      comment,
      additionalComment,
      paidAmount: paidAmount || 0,
      status: "active",
      createdBy: req.user.userId,
      intId: intId,
    });

    company.$locals.userId = req.user.userId;
    await company.save();

    // Add to current month's charges if company is active
    if (company.status === "active") {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      await updateMonthlyCharges(
        company._id,
        0,
        company.paidAmount || 0,
        company.serverCharges,
        company.companyName,
      );
    }

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find()
      .populate("createdBy", "name email")
      .sort({ renewalDate: 1 });

    res.json(companies);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateCompany = async (req: any, res: Response) => {
  try {
    let data = req.body;
    if (
      data?.inactiveDate &&
      (data.inactiveDate === "None" || !data.inactiveDate)
    ) {
      const { inactiveDate, ...dataToUpdate } = req.body;
      data = dataToUpdate;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if ((req.user.role !== "admin" && user?.email !== process.env.ADMIN_EMAIL) && data?.joiningDate) {
      return res.status(403).json({ message: "You are not authorized to update joining date" });
    }

    // Get old company to check what changed
    const oldCompany = await Company.findById(req.params.id);
    if (!oldCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const oldPaidAmount = oldCompany.paidAmount || 0;
    const newPaidAmount = data.paidAmount !== undefined ? data.paidAmount : oldPaidAmount;
    const oldServerCharges = oldCompany.serverCharges;
    const newServerCharges = data.serverCharges !== undefined ? data.serverCharges : oldServerCharges;
    const oldStatus = oldCompany.status;
    const newStatus = data.status !== undefined ? data.status : oldStatus;

    const company = await Company.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: data,
      },
      {
        new: true,
        userId: req.user.userId,
      },
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Handle different scenarios
    if (oldStatus !== newStatus) {
      // Status changed
      if (oldStatus === "active" && newStatus === "inactive") {
        // Company became inactive - remove from monthly charges
        await removeCompanyFromMonthlyCharges(company._id);
      } else if (oldStatus === "inactive" && newStatus === "active") {
        // Company became active - add to monthly charges
        await updateMonthlyCharges(
          company._id,
          0,
          company.paidAmount || 0,
          company.serverCharges,
          company.companyName,
        );
      }
    } else if (oldServerCharges !== newServerCharges) {
      // Server charges changed - recalculate entire month
      await recalculateMonthlyCharges(year, month);
    } else if (oldPaidAmount !== newPaidAmount) {
      // Only paid amount changed - use incremental update
      await updateMonthlyCharges(
        company._id,
        oldPaidAmount,
        newPaidAmount,
        company.serverCharges,
        company.companyName,
      );
    }

    res.json(company);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error });
  }
};

export const deleteCompany = async (req: any, res: Response) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id, {
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Remove from current month's charges
    await removeCompanyFromMonthlyCharges(company._id);

    res.json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
