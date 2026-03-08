import { Router } from "express";
import { createPermission, getPermissions, deletePermission, } from "../controllers/adminPermission.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/havePermission.middlerware";
const router = Router();
router.post("/", authenticate, authorize("permission.create"), createPermission);
router.get("/", authenticate, authorize("permission.read"), getPermissions);
router.delete("/:id", authenticate, authorize("permission.delete"), deletePermission);
export default router;
