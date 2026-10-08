import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import { authenticate } from "./middlewares/auth.middleware";
import { authorize } from "./middlewares/havePermission.middlerware";
import { ipWhitelist } from "./middlewares/whitelistedIps.middleware";
import { getDbStatus } from "./utils/dbStatus";

import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/company.routes";
import adminUserRoutes from "./routes/adminUser.routes";
import adminRoleRoutes from "./routes/adminRole.routes";
import adminPermissionRoutes from "./routes/adminPermission.routes";
import auditRoutes from "./routes/auditLog.routes";
import monthlyChargesRoutes from "./routes/monthlyCharges.routes";

const app = express();

/* ------------------------------------------------------------------ */
/* Networking                                                          */
/* ------------------------------------------------------------------ */

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://77.42.33.221:3000",
];

const configuredOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Behind a proxy (nginx/pm2), so rate limiting and IP checks see the real client.
app.set("trust proxy", true);

/* ------------------------------------------------------------------ */
/* Cross-cutting middleware                                            */
/* ------------------------------------------------------------------ */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Status polling must never burn the request budget.
  skip: (req) => req.path === "/api/health",
});

app.use(limiter);
app.use(ipWhitelist);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

/* ------------------------------------------------------------------ */
/* Health — always available, even with no database                    */
/* ------------------------------------------------------------------ */

app.get("/api/health", (_req, res) => {
  const database = getDbStatus();

  res.json({
    status: database.connected ? "ok" : "degraded",
    database,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    environment: process.env.NODE_ENV ?? "development",
  });
});

/**
 * Fail fast when the data layer is gone.
 *
 * Previously every query hung until mongoose's server-selection timeout, so
 * the UI reported a network error instead of the real cause. A 503 with a
 * plain message tells the operator exactly what is wrong.
 */
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  return res.status(503).json({
    message:
      "Database unavailable. The API is running but is not connected to MongoDB.",
  });
});

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/roles", adminRoleRoutes);
app.use("/api/admin/permissions", adminPermissionRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/monthly-charges", monthlyChargesRoutes);

app.get("/", authenticate, authorize("company.read"), (_req, res) => {
  res.json({
    success: true,
    message: "Dialer API Running 🚀",
  });
});

/* ------------------------------------------------------------------ */
/* Fallbacks                                                           */
/* ------------------------------------------------------------------ */

app.use((req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}` });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API error:", err);

  if (res.headersSent) return;

  res.status(err?.status ?? 500).json({
    message: err?.message ?? "Internal server error",
  });
});

export default app;
