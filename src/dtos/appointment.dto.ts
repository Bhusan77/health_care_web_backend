import { AppointmentStatus } from "../types/appointment.type";

export interface CreateAppointmentDTO {
  doctor: string;   // doctor id
  date: string;     // "YYYY-MM-DD"
  time: string;     // "HH:mm"
  reason?: string;
}

export interface CancelAppointmentDTO {
  cancelReason?: string;
}

export interface AdminUpdateStatusDTO {
  status: AppointmentStatus; // CONFIRMED | CANCELLED | COMPLETED
  note?: string;
}

export interface AdminRescheduleDTO {
  date: string;     // "YYYY-MM-DD"
  time: string;     // "HH:mm"
  note?: string;
}