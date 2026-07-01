import { Request, Response } from "express";
import { MonthlyCharges } from "../models/MonthlyCharges.model";
import { Company } from "../models/Company.model";

// Helper function to get or create monthly charges record
export const getOrCreateMonthlyCharges = async (year: number, month: number) => {
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  let monthlyCharges = await MonthlyCharges.findOne({ month: monthStr });

  if (!monthlyCharges) {
    monthlyCharges = new MonthlyCharges({
      month: monthStr,
      year,
      monthNumber: month,
      totalCharges: 0,
      totalPaid: 0,
      totalPending: 0,
      companyPayments: [],
    });
    await monthlyCharges.save();
  }

  return monthlyCharges;
};

// Recalculate all monthly totals from scratch for a given month
export const recalculateMonthlyCharges = async (year: number, month: number) => {
  const monthlyCharges = await getOrCreateMonthlyCharges(year, month);

  // Get all active companies
  const activeCompanies = await Company.find({ status: "active" });

  // Reset totals
  monthlyCharges.totalCharges = 0;
  monthlyCharges.totalPaid = 0;
  monthlyCharges.totalPending = 0;
  monthlyCharges.companyPayments = [];

  // Add all active companies
  for (const company of activeCompanies) {
    const paidAmount = company.paidAmount || 0;
    const pendingAmount = company.serverCharges - paidAmount;

    monthlyCharges.totalCharges += company.serverCharges;
    monthlyCharges.totalPaid += paidAmount;
    monthlyCharges.totalPending += pendingAmount;

    monthlyCharges.companyPayments.push({
      companyId: company._id,
      companyName: company.companyName,
      charges: company.serverCharges,
      paid: paidAmount,
      pending: pendingAmount,
    });
  }

  await monthlyCharges.save();
  return monthlyCharges;
};

// Update monthly totals when company paid amount changes
export const updateMonthlyCharges = async (
  companyId: any,
  oldPaidAmount: number,
  newPaidAmount: number,
  serverCharges: number,
  companyName: string,
) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthlyCharges = await getOrCreateMonthlyCharges(year, month);

  // Find if company already exists in this month's payments
  const existingPaymentIndex = monthlyCharges.companyPayments.findIndex(
    (payment) => payment.companyId.toString() === companyId.toString(),
  );

  const paidDifference = newPaidAmount - oldPaidAmount;
  const pendingAmount = serverCharges - newPaidAmount;

  if (existingPaymentIndex >= 0) {
    // Update existing company payment
    const oldPayment = monthlyCharges.companyPayments[existingPaymentIndex];
    
    // Recalculate totals
    monthlyCharges.totalPaid -= oldPayment.paid;
    monthlyCharges.totalPaid += newPaidAmount;
    
    monthlyCharges.totalPending -= oldPayment.pending;
    monthlyCharges.totalPending += pendingAmount;

    monthlyCharges.companyPayments[existingPaymentIndex] = {
      companyId,
      companyName,
      charges: serverCharges,
      paid: newPaidAmount,
      pending: pendingAmount,
    };
  } else {
    // Add new company payment
    monthlyCharges.totalPaid += newPaidAmount;
    monthlyCharges.totalPending += pendingAmount;
    monthlyCharges.companyPayments.push({
      companyId,
      companyName,
      charges: serverCharges,
      paid: newPaidAmount,
      pending: pendingAmount,
    });
  }

  // Recalculate total charges
  monthlyCharges.totalCharges = monthlyCharges.companyPayments.reduce(
    (sum, payment) => sum + payment.charges,
    0,
  );

  await monthlyCharges.save();
  return monthlyCharges;
};

// Remove company from monthly totals (when deleted or becomes inactive)
export const removeCompanyFromMonthlyCharges = async (companyId: any) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthlyCharges = await MonthlyCharges.findOne({
    year,
    monthNumber: month,
  });

  if (!monthlyCharges) return;

  const existingPaymentIndex = monthlyCharges.companyPayments.findIndex(
    (payment) => payment.companyId.toString() === companyId.toString(),
  );

  if (existingPaymentIndex >= 0) {
    const payment = monthlyCharges.companyPayments[existingPaymentIndex];

    monthlyCharges.totalCharges -= payment.charges;
    monthlyCharges.totalPaid -= payment.paid;
    monthlyCharges.totalPending -= payment.pending;

    monthlyCharges.companyPayments.splice(existingPaymentIndex, 1);

    await monthlyCharges.save();
  }
};

// Get current month's charges summary
export const getCurrentMonthCharges = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const monthlyCharges = await getOrCreateMonthlyCharges(year, month);

    // If this is a newly created month (no company payments yet), recalculate from all active companies
    if (monthlyCharges.companyPayments.length === 0) {
      await recalculateMonthlyCharges(year, month);
      // Fetch the updated data
      const updatedCharges = await MonthlyCharges.findOne({
        year,
        monthNumber: month,
      });
      return res.json(updatedCharges);
    }

    res.json(monthlyCharges);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Get charges for a specific month
export const getMonthCharges = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;

    const monthlyCharges = await MonthlyCharges.findOne({
      year: parseInt(Array.isArray(year) ? year[0] : year),
      monthNumber: parseInt(Array.isArray(month) ? month[0] : month),
    });

    if (!monthlyCharges) {
      return res.status(404).json({ message: "Monthly charges not found" });
    }

    res.json(monthlyCharges);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Get all monthly charges
export const getAllMonthlyCharges = async (req: Request, res: Response) => {
  try {
    const monthlyCharges = await MonthlyCharges.find().sort({
      year: -1,
      monthNumber: -1,
    });

    res.json(monthlyCharges);
  } catch (error) {
    res.status(500).json({ error });
  }
};
