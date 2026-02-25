import { HttpError } from "../../errors/http-error";
import { AppointmentRepository } from "../../repositories/appointment.repository";
import { AdminRescheduleDTO, AdminUpdateStatusDTO } from "../../dtos/appointment.dto";

const repo = new AppointmentRepository();

const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidTime = (t: string) => /^\d{2}:\d{2}$/.test(t);

export class AdminAppointmentService {
  getAllAppointments(query: any) {
    const filters: any = {};

    if (query.status) filters.status = query.status;
    if (query.doctor) filters.doctor = query.doctor;
    if (query.patient) filters.patient = query.patient;
    if (query.date) filters.date = query.date;

    return repo.findAll(filters);
  }

  async getAppointmentById(id: string) {
    const appt = await repo.findByIdPopulate(id);
    if (!appt) throw new HttpError(404, "Appointment not found");
    return appt;
  }

  async updateStatus(id: string, dto: AdminUpdateStatusDTO) {
    const appt = await repo.findById(id);
    if (!appt) throw new HttpError(404, "Appointment not found");

    // Only allow these changes (you can expand later)
    const allowed = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowed.includes(dto.status)) throw new HttpError(400, "Invalid status update");

    return repo.updateById(id, {
      status: dto.status,
      adminNote: dto.note,
    });
  }

  async reschedule(id: string, dto: AdminRescheduleDTO) {
    const appt = await repo.findById(id);
    if (!appt) throw new HttpError(404, "Appointment not found");
    if (appt.status === "CANCELLED") throw new HttpError(400, "Cannot reschedule cancelled appointment");
    if (appt.status === "COMPLETED") throw new HttpError(400, "Cannot reschedule completed appointment");

    if (!isValidDate(dto.date)) throw new HttpError(400, "Invalid date format (YYYY-MM-DD)");
    if (!isValidTime(dto.startTime) || !isValidTime(dto.endTime))
      throw new HttpError(400, "Invalid time format (HH:mm)");

    const overlap = await repo.findOverlap(
      String(appt.doctor),
      dto.date,
      dto.startTime,
      dto.endTime,
      id
    );
    if (overlap) throw new HttpError(409, "This slot is already booked");

    return repo.updateById(id, {
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      adminNote: dto.note,
    });
  }
}