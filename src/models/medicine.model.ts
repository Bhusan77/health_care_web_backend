import mongoose, { Document, Schema } from "mongoose";

export interface IMedicine extends Document {
  name: string;
  category?: string;
  price: number;
  stock: number;
  expiryDate?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    expiryDate: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export const MedicineModel = mongoose.model<IMedicine>(
  "Medicine",
  MedicineSchema
);