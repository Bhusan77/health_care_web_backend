import { Router } from "express";
import { getDoctorById, getDoctors } from "../controllers/doctor.controller";

const router = Router();

// Public/User routes
router.get("/", getDoctors);
router.get("/:id", getDoctorById);

export default router;