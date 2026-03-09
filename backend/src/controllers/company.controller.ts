import { Request, Response } from "express";
import { Company } from "../models/Company.model";

export const createCompany = async (req: any, res: Response) => {
  try {
    const {
      companyName,
      joiningDate,
      dialerLink,
      noOfServers,
      serverCharges,
      renewalDate,
      comment,
      additionalComment
    } = req.body;

    const company = new Company({
      companyName,
      joiningDate,
      dialerLink,
      noOfServers,
      serverCharges,
      renewalDate,
      comment,
      additionalComment,
      status: "active",
      createdBy: req.user.userId,
    });

    company.$locals.userId = req.user.userId;
    await company.save();

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

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
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: req.body,
      },
      {
        new: true,
        userId: req.user.userId,
      },
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
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

    res.json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
