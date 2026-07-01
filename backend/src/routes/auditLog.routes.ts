import { Router } from "express";
import {
  getAuditLogs,
  getAuditLogsByEntity,
  getEntityAuditLogs,
  getFieldAuditLogs,
} from "../controllers/auditLogs.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/havePermission.middlerware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("audit.read"),
  getAuditLogs
);

router.get(
  "/:entityType",
  authenticate,
  authorize("audit.read"),
  getAuditLogsByEntity
);

router.get(
  "/:entityType/:entityId/field/:field",
  authenticate,
  authorize("audit.read"),
  getFieldAuditLogs
);

router.get(
  "/:entityType/:entityId/:idx",
  authenticate,
  authorize("audit.read"),
  getEntityAuditLogs
);

export default router;