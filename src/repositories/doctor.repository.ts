import { DoctorModel } from "../models/doctor.model";

export class DoctorRepository {
  create(data: any) {
    return DoctorModel.create(data);
  }

  findAll() {
    return DoctorModel.find().sort({ createdAt: -1 });
  }

  findById(id: string) {
    return DoctorModel.findById(id);
  }

  updateById(id: string, data: any) {
    return DoctorModel.findByIdAndUpdate(id, data, { new: true });
  }

  deleteById(id: string) {
    return DoctorModel.findByIdAndDelete(id);
  }
}