import express from "express";
import helmet from "helmet";
import cors from "cors";
import { authenticate } from "./middlewares/auth.middleware";
import { authorize } from "./middlewares/havePermission.middlerware";

import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/company.routes";
import adminUserRoutes from "./routes/adminUser.routes";
import adminRoleRoutes from "./routes/adminRole.routes";
import adminPermissionRoutes from "./routes/adminPermission.routes";
import auditRoutes from "./routes/auditLog.routes";
import rateLimit from "express-rate-limit";
import { ipWhitelist } from "./middlewares/whitelistedIps.middleware";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

const app = express();

app.use(
  cors({
    origin: ["http://77.42.33.221:3000", "http://localhost:3001"],
    credentials: true,
  }),
);
app.use(limiter);
app.use(ipWhitelist);
app.use(helmet());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/roles", adminRoleRoutes);
app.use("/api/admin/permissions", adminPermissionRoutes);
app.use("/api/audit", auditRoutes);

app.get("/", authenticate, authorize("company.read"), (req, res) => {
  res.json({
    success: true,
    message: "Dialer API Running 🚀",
  });
});

export default app;
