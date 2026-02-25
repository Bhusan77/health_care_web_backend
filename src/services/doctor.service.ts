import { HttpError } from "../errors/http-error";
import { DoctorRepository } from "../repositories/doctor.repository";

const doctorRepo = new DoctorRepository();

/**
 * Public/User: list doctors
 * Supports optional query params:
 *  - q: search by name
 *  - specialization: exact specialization match
 */
export const getDoctorsService = async (q?: string, specialization?: string) => {
  // If your repository supports filters, you can push filtering there later.
  const doctors = await doctorRepo.findAll();

  let result = doctors as any[];

  if (specialization) {
    const spec = String(specialization).toLowerCase();
    result = result.filter(
      (d) => String(d.specialization || "").toLowerCase() === spec
    );
  }

  if (q) {
    const search = String(q).toLowerCase();
    result = result.filter((d) =>
      String(d.name || "").toLowerCase().includes(search)
    );
  }

  return result;
};

/**
 * Public/User: doctor details
 */
export const getDoctorByIdService = async (id: string) => {
  const doctor = await doctorRepo.findById(id);
  if (!doctor) throw new HttpError(404, "Doctor not found");
  return doctor;
};