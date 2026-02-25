import mongoose from "mongoose";
import { AppointmentModel, IAppointment } from "../models/appointment.model";
import { AppointmentStatus } from "../types/appointment.type";

export class AppointmentRepository {
  create(data: Partial<IAppointment>) {
    return AppointmentModel.create(data);
  }

  findById(id: string) {
    return AppointmentModel.findById(id);
  }

  findByIdPopulate(id: string) {
    return AppointmentModel.findById(id)
      .populate("doctor")
      .populate("patient", "-password");
  }

  findMine(patientId: string) {
    return AppointmentModel.find({ patient: patientId })
      .sort({ date: -1, startTime: -1 })
      .populate("doctor");
  }

  findAll(filters: any = {}) {
    return AppointmentModel.find(filters)
      .sort({ date: -1, startTime: -1 })
      .populate("doctor")
      .populate("patient", "-password");
  }

  updateById(id: string, update: any) {
    return AppointmentModel.findByIdAndUpdate(id, update, { new: true })
      .populate("doctor")
      .populate("patient", "-password");
  }

  // Overlap check:
  // existing.start < newEnd AND existing.end > newStart
  async findOverlap(
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
    ignoreAppointmentId?: string
  ) {
    const q: any = {
      doctor: new mongoose.Types.ObjectId(doctorId),
      date,
      status: { $ne: "CANCELLED" as AppointmentStatus },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };

    if (ignoreAppointmentId) {
      q._id = { $ne: new mongoose.Types.ObjectId(ignoreAppointmentId) };
    }

    return AppointmentModel.findOne(q);
  }
}