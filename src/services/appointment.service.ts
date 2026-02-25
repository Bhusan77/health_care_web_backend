import { HttpError } from "../errors/http-error";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { CreateAppointmentDTO, CancelAppointmentDTO } from "../dtos/appointment.dto";
import { DoctorModel } from "../models/doctor.model";

const repo = new AppointmentRepository();

const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidTime = (t: string) => /^\d{2}:\d{2}$/.test(t);
const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export class AppointmentService {
  async createAppointment(patientId: string, dto: CreateAppointmentDTO) {
    const { doctor, date, startTime, endTime, reason } = dto;

    if (!doctor) throw new HttpError(400, "Doctor is required");
    if (!isValidDate(date)) throw new HttpError(400, "Invalid date format (YYYY-MM-DD)");
    if (!isValidTime(startTime) || !isValidTime(endTime))
      throw new HttpError(400, "Invalid time format (HH:mm)");

    const s = timeToMinutes(startTime);
    const e = timeToMinutes(endTime);
    if (e <= s) throw new HttpError(400, "End time must be after start time");

    const doctorExists = await DoctorModel.findById(doctor);
    if (!doctorExists) throw new HttpError(404, "Doctor not found");

    const overlap = await repo.findOverlap(doctor, date, startTime, endTime);
    if (overlap) throw new HttpError(409, "This slot is already booked");

    const appt = await repo.create({
      patient: patientId as any,
      doctor: doctor as any,
      date,
      startTime,
      endTime,
      reason,
      status: "PENDING",
    });

    return appt;
  }

  getMyAppointments(patientId: string) {
    return repo.findMine(patientId);
  }

  async getMyAppointmentById(patientId: string, appointmentId: string) {
    const appt = await repo.findByIdPopulate(appointmentId);
    if (!appt) throw new HttpError(404, "Appointment not found");
    if (String(appt.patient?._id ?? appt.patient) !== String(patientId)) {
      throw new HttpError(403, "Forbidden");
    }
    return appt;
  }

  async cancelMyAppointment(
    patientId: string,
    appointmentId: string,
    dto: CancelAppointmentDTO
  ) {
    const appt = await repo.findById(appointmentId);
    if (!appt) throw new HttpError(404, "Appointment not found");

    if (String(appt.patient) !== String(patientId)) {
      throw new HttpError(403, "Forbidden");
    }

    if (appt.status === "CANCELLED") throw new HttpError(400, "Already cancelled");
    if (appt.status === "COMPLETED") throw new HttpError(400, "Cannot cancel completed appointment");

    return repo.updateById(appointmentId, {
      status: "CANCELLED",
      cancelReason: dto.cancelReason ?? "Cancelled by user",
    });
  }
}