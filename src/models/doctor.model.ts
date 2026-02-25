import mongoose, { Document, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  fee: number;

  phone?: string;
  clinicAddress?: string;
  bio?: string;
  profile?: string;

  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },

    phone: { type: String },
    clinicAddress: { type: String },
    bio: { type: String },
    profile: { type: String }, // image filename if needed
  },
  { timestamps: true }
);

export const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);