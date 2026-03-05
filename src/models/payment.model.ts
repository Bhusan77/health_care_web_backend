import { Schema, model, Types } from "mongoose";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },

    provider: { type: String, default: "ESEWA" },
    amount: { type: Number, required: true },

    // your unique reference (pid)
    transactionRef: { type: String, required: true, unique: true },

    // refId returned by eSewa after payment
    esewaRefId: { type: String, default: null },

    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
  },
  { timestamps: true }
);

export const PaymentModel = model("Payment", paymentSchema);