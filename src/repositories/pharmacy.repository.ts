import { MedicineModel } from "../models/medicine.model";

export class PharmacyRepository {

  create(data: any) {
    return MedicineModel.create(data);
  }

  findAll() {
    return MedicineModel.find().sort({ createdAt: -1 });
  }

  findById(id: string) {
    return MedicineModel.findById(id);
  }

  updateById(id: string, data: any) {
    return MedicineModel.findByIdAndUpdate(id, data, { new: true });
  }

  deleteById(id: string) {
    return MedicineModel.findByIdAndDelete(id);
  }
}