import { Router } from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/havePermission.middlerware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("company.create"),
  createCompany
);

router.get(
  "/",
  authenticate,
  authorize("company.read"),
  getCompanies
);

router.get(
  "/:id",
  authenticate,
  authorize("company.read"),
  getCompanyById
);

router.put(
  "/:id",
  authenticate,
  authorize("company.update"),
  updateCompany
);

router.delete(
  "/:id",
  authenticate,
  authorize("company.delete"),
  deleteCompany
);

export default router;