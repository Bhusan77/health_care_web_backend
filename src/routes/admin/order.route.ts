import { Router } from "express";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middleware/authorized.middleware";
import { AdminOrderController } from "../../controllers/admin/order.controller";

const router = Router();
const controller = new AdminOrderController();

router.get("/", authorizedMiddleware, adminOnlyMiddleware, controller.all.bind(controller));
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, controller.getById.bind(controller));
router.patch("/:id/status", authorizedMiddleware, adminOnlyMiddleware, controller.updateStatus.bind(controller));

export default router;