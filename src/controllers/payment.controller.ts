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
    let txnId = String(req.query.transaction_uuid || req.query.txnUuid || "");
    const dataEncoded = String(req.query.data || "");

    if (!txnId && dataEncoded) {
      try {
        const decoded = JSON.parse(Buffer.from(dataEncoded, "base64").toString("utf-8"));
        txnId = decoded.transaction_uuid || decoded.transaction_id || "";
      } catch (e) {}
    }

    if (!txnId) {
      return res.redirect(`${FRONTEND_FAILURE}?reason=missing_transaction_uuid`);
    }

    const totalAmountRaw = String(req.query.total_amount || "");
    const totalAmount = totalAmountRaw ? Number(totalAmountRaw.replace(/,/g, "")) : undefined;

    const { payment } = await PaymentService.handleEsewaSuccessV2({ txnUuid: txnId, totalAmount });

    return res.json({
      success: true,
      message: "Payment verified successfully",
      pid: txnId,
      refId: payment?.esewaRefId || ""
    });
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Payment verification failed"
    });
  }
};

export const esewaFailure = async (req: Request, res: Response) => {
  try {
    let txnId = String(
      req.query.transaction_uuid ||
        req.query.txnUuid ||
        req.query.pid ||
        req.query.oid ||
        ""
    );

    const dataEncoded = String(req.query.data || "");
    if (!txnId && dataEncoded) {
      try {
        const decoded = JSON.parse(Buffer.from(dataEncoded, "base64").toString("utf-8"));
        txnId = decoded.transaction_uuid || decoded.transaction_id || "";
      } catch (e) {}
    }

    await PaymentService.handleEsewaFailure(txnId || undefined);

    return res.json({
      success: false,
      message: "Payment failed or cancelled",
      pid: txnId || ""
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process failure callback"
    });
  }
};