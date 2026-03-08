import { HttpError } from "../errors/http-error";
import { PaymentModel } from "../models/payment.model";
import { buildEsewaForm, verifyEsewaPayment } from "./esewa.service";
import { OrderModel } from "../models/order.model";

const makeTxnRef = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const initiateEsewaForOrder = async (userId: string, orderId: string) => {
  const order = await OrderModel.findById(orderId);
  if (!order) throw new HttpError(404, "Order not found");

  if (String(order.user) !== String(userId)) {
    throw new HttpError(403, "Not your order");
  }

  if (order.status !== "PENDING") {
    throw new HttpError(409, "Order cannot be paid in current state");
  }

  const transactionRef = makeTxnRef();

  const payment = await PaymentModel.create({
    user: userId,
    order: orderId,
    amount: order.total,
    transactionRef,
    status: "PENDING",
  });

  const { paymentUrl, formData } = buildEsewaForm({
    amount: order.total,
    txnUuid: transactionRef,
  });

  return {
    paymentId: payment._id,
    paymentUrl,
    formData,
    transactionRef,
  };
};

export const handleEsewaSuccessV2 = async (args: {
  txnUuid: string;
  totalAmount?: number;
  status?: string;
}) => {
  const { txnUuid, totalAmount } = args;

  const payment = await PaymentModel.findOne({ transactionRef: txnUuid });
  if (!payment) throw new HttpError(404, "Payment record not found");

  if (payment.status === "SUCCESS") {
    return { already: true, payment };
  }

  const amountToVerify =
    typeof totalAmount === "number" && Number.isFinite(totalAmount)
      ? totalAmount
      : payment.amount;

  const verify = await verifyEsewaPayment({
    txnUuid,
    totalAmount: amountToVerify,
  });

  console.log(
    "DEBUG: ESEWA VERIFY RESPONSE BODY:",
    JSON.stringify(verify.raw, null, 2)
  );

  if (!verify.ok) {
    payment.status = "FAILED";
    await payment.save();

    await OrderModel.findByIdAndUpdate(payment.order, {
      status: "PENDING",
      paymentStatus: "FAILED",
      paymentMethod: "ESEWA",
    });

    throw new HttpError(400, "Payment verification failed");
  }

  payment.status = "SUCCESS";

  const esewaRefId =
    verify.raw?.ref_id ||
    verify.raw?.transaction_code ||
    verify.raw?.refId ||
    verify.raw?.transaction?.transaction_code ||
    verify.raw?.data?.transaction_code ||
    verify.raw?.result?.transaction_code ||
    null;

  if (esewaRefId) {
    payment.esewaRefId = String(esewaRefId);
  }

  await payment.save();

  await OrderModel.findByIdAndUpdate(payment.order, {
    status: "CONFIRMED",
    paymentStatus: "SUCCESS",
    paymentMethod: "ESEWA",
  });

  return { already: false, payment };
};

export const handleEsewaFailure = async (txnUuid?: string) => {
  if (!txnUuid) return { updated: false };

  const payment = await PaymentModel.findOne({ transactionRef: txnUuid });
  if (!payment) return { updated: false };

  payment.status = "FAILED";
  await payment.save();

  await OrderModel.findByIdAndUpdate(payment.order, {
    status: "PENDING",
    paymentStatus: "FAILED",
    paymentMethod: "ESEWA",
  });

  return { updated: true };
};