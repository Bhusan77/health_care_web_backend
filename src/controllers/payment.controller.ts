import { Request, Response } from "express";
import * as PaymentService from "../services/payment.service";

const FRONTEND_SUCCESS =
  process.env.FRONTEND_SUCCESS_URL || "http://localhost:3000/payment/success";
const FRONTEND_FAILURE =
  process.env.FRONTEND_FAILURE_URL || "http://localhost:3000/payment/failure";

export const initiateEsewa = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user?._id);
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const data = await PaymentService.initiateEsewaForOrder(userId, orderId);

    return res.json({
      success: true,
      message: "Payment initiated",
      ...data,
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const esewaSuccess = async (req: Request, res: Response) => {
  try {
    const txnUuid = String(
      req.query.transaction_uuid ||
        req.query.txnUuid ||
        req.query.pid ||
        req.query.oid ||
        ""
    );

    const totalAmountRaw = String(req.query.total_amount || "");

    if (!txnUuid) {
      return res.redirect(`${FRONTEND_FAILURE}?reason=missing_transaction_uuid`);
    }

    const totalAmount = totalAmountRaw ? Number(totalAmountRaw) : undefined;

    await PaymentService.handleEsewaSuccessV2({ txnUuid, totalAmount });

    return res.redirect(`${FRONTEND_SUCCESS}?txn=${encodeURIComponent(txnUuid)}`);
  } catch (error: any) {
    return res.redirect(
      `${FRONTEND_FAILURE}?reason=${encodeURIComponent(error.message || "verify_failed")}`
    );
  }
};

export const esewaFailure = async (req: Request, res: Response) => {
  try {
    const txnUuid = String(
      req.query.transaction_uuid ||
        req.query.txnUuid ||
        req.query.pid ||
        req.query.oid ||
        ""
    );

    await PaymentService.handleEsewaFailure(txnUuid || undefined);

    const url =
      `${FRONTEND_FAILURE}?reason=cancelled_or_failed` +
      (txnUuid ? `&txn=${encodeURIComponent(txnUuid)}` : "");

    return res.redirect(url);
  } catch (error: any) {
    return res.redirect(
      `${FRONTEND_FAILURE}?reason=${encodeURIComponent(error.message || "failed")}`
    );
  }
};