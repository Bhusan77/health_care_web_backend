import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface IOrderItem {
  medicine: mongoose.Types.ObjectId;
  qty: number;
  priceAtPurchase: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  deliveryAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    medicine: { type: Schema.Types.ObjectId, ref: "Medicine", required: true },
    qty: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    deliveryAddress: { type: String },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);