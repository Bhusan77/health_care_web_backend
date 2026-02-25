import mongoose, { Document, Schema } from "mongoose";
import { AppointmentStatus } from "../types/appointment.type";

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId; // User
  doctor: mongoose.Types.ObjectId;  // Doctor

  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"

  reason?: string;

  status: AppointmentStatus;

  cancelReason?: string;
  adminNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },

    date: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },

    reason: { type: String, trim: true },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      required: true,
    },

    cancelReason: { type: String, trim: true },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

// Helpful index for searches
AppointmentSchema.index({ doctor: 1, date: 1, startTime: 1, endTime: 1 });
AppointmentSchema.index({ patient: 1, date: 1 });

export const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);