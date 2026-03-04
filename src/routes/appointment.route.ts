import { Router } from "express";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { AppointmentController } from "../controllers/appointment.controller";

const router = Router();
const controller = new AppointmentController();
router.post("/", authorizedMiddleware, controller.create.bind(controller));
router.get("/me", authorizedMiddleware, controller.myAppointments.bind(controller));
router.get("/:id", authorizedMiddleware, controller.getById.bind(controller));
router.patch("/:id/cancel", authorizedMiddleware, controller.cancel.bind(controller));

export default router;