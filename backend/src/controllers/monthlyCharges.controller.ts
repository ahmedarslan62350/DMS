import { Request, Response } from "express";
import { MonthlyCharges } from "../models/MonthlyCharges.model";
import { Company } from "../models/Company.model";

const monthKey = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

const buildPaymentsFromCompanies = (
  companies: Array<{
    _id: any;
    companyName: string;
    serverCharges: number;
    paidAmount?: number;
  }>,
  forcePaidZero = false,
) => {
  let totalCharges = 0;
  let totalPaid = 0;
  let totalPending = 0;

  const companyPayments = companies.map((company) => {
    const charges = company.serverCharges || 0;
    const paid = forcePaidZero ? 0 : company.paidAmount || 0;
    const pending = charges - paid;

    totalCharges += charges;
    totalPaid += paid;
    totalPending += pending;

    return {
      companyId: company._id,
      companyName: company.companyName,
      charges,
      paid,
      pending,
    };
  });

  return { companyPayments, totalCharges, totalPaid, totalPending };
};

/** Start a fresh billing month: reset all company paidAmount and seed all active companies at paid=0 */
export const initializeNewMonth = async (year: number, month: number) => {
  const monthStr = monthKey(year, month);

  await Company.updateMany({}, { $set: { paidAmount: 0 } });

  const activeCompanies = await Company.find({ status: "active" });
  const totals = buildPaymentsFromCompanies(activeCompanies, true);

  let monthlyCharges = await MonthlyCharges.findOne({ month: monthStr });

  if (monthlyCharges) {
    monthlyCharges.year = year;
    monthlyCharges.monthNumber = month;
    monthlyCharges.totalCharges = totals.totalCharges;
    monthlyCharges.totalPaid = totals.totalPaid;
    monthlyCharges.totalPending = totals.totalPending;
    monthlyCharges.companyPayments = totals.companyPayments as any;
    await monthlyCharges.save();
  } else {
    monthlyCharges = new MonthlyCharges({
      month: monthStr,
      year,
      monthNumber: month,
      ...totals,
    });
    await monthlyCharges.save();
  }

  return monthlyCharges;
};

/**
 * Get month record, or create a fresh one (paid reset) if it does not exist yet.
 * Optionally preserve paidAmount for one company (e.g. the one just updated).
 */
export const getOrCreateMonthlyCharges = async (
  year: number,
  month: number,
  options?: { preservePaidForCompanyId?: any },
) => {
  const monthStr = monthKey(year, month);
  let monthlyCharges = await MonthlyCharges.findOne({ month: monthStr });

  if (monthlyCharges) {
    return monthlyCharges;
  }

  const preserveId = options?.preservePaidForCompanyId
    ? options.preservePaidForCompanyId.toString()
    : null;

  if (preserveId) {
    await Company.updateMany(
      { _id: { $ne: preserveId } },
      { $set: { paidAmount: 0 } },
    );
  } else {
    await Company.updateMany({}, { $set: { paidAmount: 0 } });
  }

  const activeCompanies = await Company.find({ status: "active" });
  const totals = buildPaymentsFromCompanies(activeCompanies, false);

  monthlyCharges = new MonthlyCharges({
    month: monthStr,
    year,
    monthNumber: month,
    ...totals,
  });
  await monthlyCharges.save();

  return monthlyCharges;
};

/** Add any active companies missing from this month's snapshot (as unpaid) */
export const ensureMonthComplete = async (year: number, month: number) => {
  const monthlyCharges = await getOrCreateMonthlyCharges(year, month);
  const activeCompanies = await Company.find({ status: "active" });
  const existingIds = new Set(
    monthlyCharges.companyPayments.map((p) => p.companyId.toString()),
  );

  let changed = false;

  for (const company of activeCompanies) {
    if (existingIds.has(company._id.toString())) continue;

    // Missing from this month → treat as unpaid for the current billing cycle
    if ((company.paidAmount || 0) !== 0) {
      company.paidAmount = 0;
      await company.save();
    }

    const charges = company.serverCharges || 0;
    monthlyCharges.companyPayments.push({
      companyId: company._id,
      companyName: company.companyName,
      charges,
      paid: 0,
      pending: charges,
    });
    monthlyCharges.totalCharges += charges;
    monthlyCharges.totalPending += charges;
    changed = true;
  }

  if (changed) {
    await monthlyCharges.save();
  }

  return monthlyCharges;
};

/** Recalculate month totals from current company paidAmount / charges (mid-month sync) */
export const recalculateMonthlyCharges = async (year: number, month: number) => {
  const monthlyCharges = await getOrCreateMonthlyCharges(year, month);
  const activeCompanies = await Company.find({ status: "active" });
  const totals = buildPaymentsFromCompanies(activeCompanies, false);

  monthlyCharges.totalCharges = totals.totalCharges;
  monthlyCharges.totalPaid = totals.totalPaid;
  monthlyCharges.totalPending = totals.totalPending;
  monthlyCharges.companyPayments = totals.companyPayments as any;

  await monthlyCharges.save();
  return monthlyCharges;
};

/** Update monthly totals when a company's paid amount changes */
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
  const monthStr = monthKey(year, month);

  let monthlyCharges = await MonthlyCharges.findOne({ month: monthStr });

  if (!monthlyCharges) {
    // New calendar month: reset everyone else's paid, keep this company's payment
    monthlyCharges = await getOrCreateMonthlyCharges(year, month, {
      preservePaidForCompanyId: companyId,
    });
  } else {
    monthlyCharges = await ensureMonthComplete(year, month);
  }

  const existingPaymentIndex = monthlyCharges.companyPayments.findIndex(
    (payment) => payment.companyId.toString() === companyId.toString(),
  );

  const pendingAmount = serverCharges - newPaidAmount;

  if (existingPaymentIndex >= 0) {
    const oldPayment = monthlyCharges.companyPayments[existingPaymentIndex];

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

  monthlyCharges.totalCharges = monthlyCharges.companyPayments.reduce(
    (sum, payment) => sum + payment.charges,
    0,
  );

  await monthlyCharges.save();
  return monthlyCharges;
};

/** Remove company from monthly totals (when deleted or becomes inactive) */
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

/** Get current month's charges summary */
export const getCurrentMonthCharges = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = monthKey(year, month);

    const existing = await MonthlyCharges.findOne({ month: monthStr });

    // First request of a new calendar month → reset paid amounts and seed all companies
    if (!existing) {
      const monthlyCharges = await initializeNewMonth(year, month);
      return res.json(monthlyCharges);
    }

    const monthlyCharges = await ensureMonthComplete(year, month);
    res.json(monthlyCharges);
  } catch (error) {
    res.status(500).json({ error });
  }
};

/** Get charges for a specific month */
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

/** Get all monthly charges */
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
