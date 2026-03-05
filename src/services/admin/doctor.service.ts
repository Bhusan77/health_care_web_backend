import { HttpError } from "../../errors/http-error";
import { DoctorRepository } from "../../repositories/doctor.repository";

const doctorRepo = new DoctorRepository();

export const createDoctorService = async (data: any) => {
  const { name, specialization, fee } = data;

  if (!name || !specialization || fee === undefined) {
    throw new HttpError(400, "name, specialization and fee are required");
  }

  if (fee < 0) throw new HttpError(400, "fee must be >= 0");

  return doctorRepo.create(data);
};

export const getDoctorsService = async () => {
  return doctorRepo.findAll();
};

export const getDoctorByIdService = async (id: string) => {
  const doctor = await doctorRepo.findById(id);
  if (!doctor) throw new HttpError(404, "Doctor not found");
  return doctor;
};

export const updateDoctorService = async (id: string, data: any) => {
  const updated = await doctorRepo.updateById(id, data);
  if (!updated) throw new HttpError(404, "Doctor not found");
  return updated;
};

export const deleteDoctorService = async (id: string) => {
  const deleted = await doctorRepo.deleteById(id);
  if (!deleted) throw new HttpError(404, "Doctor not found");
  return deleted;
};