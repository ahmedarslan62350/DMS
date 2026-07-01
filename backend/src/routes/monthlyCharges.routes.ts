import { Router } from "express";
import {
  getCurrentMonthCharges,
  getMonthCharges,
  getAllMonthlyCharges,
} from "../controllers/monthlyCharges.controller";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/current", authenticate, getCurrentMonthCharges);

router.get("/:year/:month", authenticate, getMonthCharges);

router.get("/", authenticate, getAllMonthlyCharges);

export default router;
