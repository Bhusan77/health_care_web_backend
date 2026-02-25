import { Router } from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctors,
  updateDoctor,
} from "../../controllers/admin/doctor.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middleware/authorized.middleware";

const router = Router();

router.post("/", authorizedMiddleware, adminOnlyMiddleware, createDoctor);
router.get("/", authorizedMiddleware, adminOnlyMiddleware, getDoctors);
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, getDoctorById);
router.patch("/:id", authorizedMiddleware, adminOnlyMiddleware, updateDoctor);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, deleteDoctor);

export default router;