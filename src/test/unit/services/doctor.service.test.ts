import { getDoctorsService, getDoctorByIdService } from "../../../services/doctor.service";
import { DoctorRepository } from "../../../repositories/doctor.repository";
import { HttpError } from "../../../errors/http-error";

describe("DoctorService (unit)", () => {

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // -------------------------
  // getDoctorsService
  // -------------------------

  test("getDoctorsService -> returns all doctors", async () => {

    const doctors = [
      { _id: "1", name: "John Doe", specialization: "Cardiology" },
      { _id: "2", name: "Jane Smith", specialization: "Dermatology" }
    ];

    jest
      .spyOn(DoctorRepository.prototype, "findAll")
      .mockResolvedValue(doctors as any);

    const result = await getDoctorsService();

    expect(result.length).toBe(2);
    expect(result).toEqual(doctors);
  });

  test("getDoctorsService -> filters by specialization", async () => {

    const doctors = [
      { _id: "1", name: "John", specialization: "Cardiology" },
      { _id: "2", name: "Jane", specialization: "Dermatology" }
    ];

    jest
      .spyOn(DoctorRepository.prototype, "findAll")
      .mockResolvedValue(doctors as any);

    const result = await getDoctorsService(undefined, "Cardiology");

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("John");
  });

  test("getDoctorsService -> filters by name search", async () => {

    const doctors = [
      { _id: "1", name: "John Doe", specialization: "Cardiology" },
      { _id: "2", name: "Jane Smith", specialization: "Dermatology" }
    ];

    jest
      .spyOn(DoctorRepository.prototype, "findAll")
      .mockResolvedValue(doctors as any);

    const result = await getDoctorsService("john");

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("John Doe");
  });

  test("getDoctorsService -> filters by name AND specialization", async () => {

    const doctors = [
      { _id: "1", name: "John Doe", specialization: "Cardiology" },
      { _id: "2", name: "Jane Doe", specialization: "Cardiology" },
      { _id: "3", name: "Jane Smith", specialization: "Dermatology" }
    ];

    jest
      .spyOn(DoctorRepository.prototype, "findAll")
      .mockResolvedValue(doctors as any);

    const result = await getDoctorsService("john", "Cardiology");

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("John Doe");
  });

  test("getDoctorsService -> returns empty if no match", async () => {

    const doctors = [
      { _id: "1", name: "John Doe", specialization: "Cardiology" }
    ];

    jest
      .spyOn(DoctorRepository.prototype, "findAll")
      .mockResolvedValue(doctors as any);

    const result = await getDoctorsService("abc");

    expect(result.length).toBe(0);
  });

  // -------------------------
  // getDoctorByIdService
  // -------------------------

  test("getDoctorByIdService -> throws 404 if doctor not found", async () => {

    jest
      .spyOn(DoctorRepository.prototype, "findById")
      .mockResolvedValue(null);

    await expect(
      getDoctorByIdService("d1")
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("getDoctorByIdService -> returns doctor", async () => {

    const doctor = { _id: "1", name: "John", specialization: "Cardiology" };

    jest
      .spyOn(DoctorRepository.prototype, "findById")
      .mockResolvedValue(doctor as any);

    const result = await getDoctorByIdService("1");

    expect(result).toEqual(doctor);
  });

});