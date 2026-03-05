import { Router } from "express";
import * as PaymentController from "../controllers/payment.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();

router.post("/esewa/initiate", authorizedMiddleware, PaymentController.initiateEsewa);

// public callbacks
router.get("/esewa/success", PaymentController.esewaSuccess);
router.get("/esewa/failure", PaymentController.esewaFailure);

export default router;