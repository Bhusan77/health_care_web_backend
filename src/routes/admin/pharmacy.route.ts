import { Router } from "express";
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} from "../../controllers/admin/pharmacy.controller";
import {
  authorizedMiddleware,
  adminOnlyMiddleware,
} from "../../middleware/authorized.middleware";

const router = Router();

router.post("/", authorizedMiddleware, adminOnlyMiddleware, createMedicine);
router.get("/", authorizedMiddleware, adminOnlyMiddleware, getMedicines);
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, getMedicineById);
router.patch("/:id", authorizedMiddleware, adminOnlyMiddleware, updateMedicine);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, deleteMedicine);

export default router;