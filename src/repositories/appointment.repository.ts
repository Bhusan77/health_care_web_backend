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
      .sort({ date: -1, time: -1 })
      .populate("doctor");
  }

  findAll(filters: any = {}) {
    return AppointmentModel.find(filters)
      .sort({ date: -1, time: -1 })
      .populate("doctor")
      .populate("patient", "-password");
  }

 
  async findSameSlot(doctor: string, date: string, time: string) {
    return AppointmentModel.findOne({
      doctor: new mongoose.Types.ObjectId(doctor),
      date,
      time,
      status: { $ne: "CANCELLED" as AppointmentStatus },
    });
  }

  updateById(id: string, update: any) {
    return AppointmentModel.findByIdAndUpdate(id, update, { new: true })
      .populate("doctor")
      .populate("patient", "-password");
  }
}