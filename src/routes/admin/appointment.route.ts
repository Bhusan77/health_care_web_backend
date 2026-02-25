import { Router } from "express";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middleware/authorized.middleware";
import { AdminAppointmentController } from "../../controllers/admin/appointment.controller";

const router = Router();
const controller = new AdminAppointmentController();

router.get("/", authorizedMiddleware, adminOnlyMiddleware, controller.all.bind(controller));
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, controller.getById.bind(controller));
router.patch("/:id/status", authorizedMiddleware, adminOnlyMiddleware, controller.updateStatus.bind(controller));
router.patch("/:id/reschedule", authorizedMiddleware, adminOnlyMiddleware, controller.reschedule.bind(controller));

export default router;