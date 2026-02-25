import { Router } from "express";
import {
  listMedicines,
  createOrder,
  myOrders,
} from "../controllers/pharmacy.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();

// Public: view medicines
router.get("/medicines", listMedicines);

// User: orders
router.post("/orders", authorizedMiddleware, createOrder);
router.get("/orders/me", authorizedMiddleware, myOrders);

export default router;