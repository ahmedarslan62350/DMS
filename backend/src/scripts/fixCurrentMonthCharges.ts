/**
 * One-time repair: reset company paidAmount and rebuild the current month's
 * MonthlyCharges snapshot (fixes carry-over / partial-seed mismatch).
 *
 * Usage (from backend/):
 *   npx tsx src/scripts/fixCurrentMonthCharges.ts
 *
 * Optional flags:
 *   --year=2026 --month=8   (defaults to today's year/month)
 *   --dry-run               (print what would change, no writes)
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { Company } from "../models/Company.model";
import { MonthlyCharges } from "../models/MonthlyCharges.model";
import { initializeNewMonth } from "../controllers/monthlyCharges.controller";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const parseArgs = () => {
  const args = process.argv.slice(2);
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let dryRun = false;

  for (const arg of args) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--year=")) year = parseInt(arg.split("=")[1], 10);
    else if (arg.startsWith("--month=")) month = parseInt(arg.split("=")[1], 10);
  }

  if (!year || !month || month < 1 || month > 12 || Number.isNaN(year)) {
    throw new Error("Invalid --year / --month");
  }

  return { year, month, dryRun };
};

const main = async () => {
  const { year, month, dryRun } = parseArgs();
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in .env");
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");
  console.log(`📅 Target month: ${monthStr}${dryRun ? " (dry-run)" : ""}`);

  const activeCompanies = await Company.find({ status: "active" });
  const companiesWithPaid = await Company.countDocuments({
    paidAmount: { $gt: 0 },
  });
  const existingMonth = await MonthlyCharges.findOne({ month: monthStr });

  console.log("—— Before ——");
  console.log(`  Active companies: ${activeCompanies.length}`);
  console.log(`  Companies with paidAmount > 0: ${companiesWithPaid}`);
  if (existingMonth) {
    console.log(
      `  Month record: charges=${existingMonth.totalCharges}, paid=${existingMonth.totalPaid}, pending=${existingMonth.totalPending}, companies=${existingMonth.companyPayments.length}`,
    );
  } else {
    console.log("  Month record: (none)");
  }

  if (dryRun) {
    console.log("\nDry-run only — no changes written.");
    console.log(
      `Would reset all Company.paidAmount to 0 and rebuild ${monthStr} with ${activeCompanies.length} active companies at paid=0.`,
    );
    await mongoose.disconnect();
    return;
  }

  const rebuilt = await initializeNewMonth(year, month);

  console.log("\n—— After ——");
  console.log(
    `  Month record: charges=${rebuilt.totalCharges}, paid=${rebuilt.totalPaid}, pending=${rebuilt.totalPending}, companies=${rebuilt.companyPayments.length}`,
  );
  console.log(`  All company paidAmount reset to 0`);
  console.log(`\n✅ Fixed mismatch for ${monthStr}`);

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error("❌ Fix script failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
