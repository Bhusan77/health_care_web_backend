import crypto from "crypto";
import axios from "axios";

type BuildV2Args = {
  amount: number;
  txnUuid: string;
};

export const buildEsewaForm = ({ amount, txnUuid }: BuildV2Args) => {
  const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE;
  const SECRET_KEY = process.env.ESEWA_SECRET_KEY;
  const FORM_URL = process.env.ESEWA_FORM_URL;

  const SU = process.env.ESEWA_CALLBACK_SUCCESS_URL;
  const FU = process.env.ESEWA_CALLBACK_FAILURE_URL;

  if (!PRODUCT_CODE || !SECRET_KEY || !FORM_URL || !SU || !FU) {
    throw new Error("eSewa RC env missing");
  }

  const amt = Number(amount);
  const tax_amount = 0;
  const product_service_charge = 0;
  const product_delivery_charge = 0;

  const total_amount =
    amt + tax_amount + product_service_charge + product_delivery_charge;

  // signed fields in fixed order
  const signed_field_names = "total_amount,transaction_uuid,product_code";

  const formData: Record<string, string> = {
    amount: amt.toFixed(2),
    tax_amount: tax_amount.toFixed(2),
    total_amount: total_amount.toFixed(2),
    transaction_uuid: txnUuid,
    product_code: PRODUCT_CODE,
    product_service_charge: product_service_charge.toFixed(2),
    product_delivery_charge: product_delivery_charge.toFixed(2),
    success_url: SU,
    failure_url: FU,
    signed_field_names,
  };

  const baseString = signed_field_names
    .split(",")
    .map((k) => `${k}=${formData[k]}`)
    .join(",");

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(baseString)
    .digest("base64");

  return {
    paymentUrl: FORM_URL,
    formData: { ...formData, signature },
  };
};

type StatusArgs = {
  txnUuid: string;
  totalAmount: number;
};

export const verifyEsewaPayment = async ({ txnUuid, totalAmount }: StatusArgs) => {
  const STATUS_URL = process.env.ESEWA_STATUS_URL;
  const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE;

  if (!STATUS_URL || !PRODUCT_CODE) {
    throw new Error("eSewa status env missing");
  }

  const base = STATUS_URL.endsWith("/") ? STATUS_URL : `${STATUS_URL}/`;

  const url =
    `${base}?product_code=${encodeURIComponent(PRODUCT_CODE)}` +
    `&transaction_uuid=${encodeURIComponent(txnUuid)}` +
    `&total_amount=${encodeURIComponent(Number(totalAmount).toFixed(2))}`;

  const res = await axios.get(url, { timeout: 15000 });
  const payload = res.data;

  // RC commonly returns something like:
  // { status: "COMPLETE", ... }
  const status =
    payload?.status ||
    payload?.data?.status ||
    payload?.transaction?.status ||
    payload?.result?.status;

  const s = String(status || "").toUpperCase();

  return { ok: s === "COMPLETE" || s === "SUCCESS", raw: payload };
};