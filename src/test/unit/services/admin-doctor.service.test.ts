import { HttpError } from "../../../errors/http-error";
import { DoctorRepository } from "../../../repositories/doctor.repository";

import {
  createDoctorService,
  getDoctorsService,
  getDoctorByIdService,
  updateDoctorService,
  deleteDoctorService,
} from "../../../services/admin/doctor.service";

describe("Admin Doctor Service (unit)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("createDoctorService -> throws 400 if name missing", async () => {
    await expect(
      createDoctorService({ specialization: "Cardio", fee: 100 })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "name, specialization and fee are required",
      })
    );
  });

  test("createDoctorService -> throws 400 if specialization missing", async () => {
    await expect(
      createDoctorService({ name: "Dr A", fee: 100 })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "name, specialization and fee are required",
      })
    );
  });

  test("createDoctorService -> throws 400 if fee missing", async () => {
    await expect(
      createDoctorService({ name: "Dr A", specialization: "Cardio" })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "name, specialization and fee are required",
      })
    );
  });

  test("createDoctorService -> throws 400 if fee < 0", async () => {
    await expect(
      createDoctorService({ name: "Dr A", specialization: "Cardio", fee: -1 })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "fee must be >= 0",
      })
    );
  });

  test("createDoctorService -> calls repo.create when valid", async () => {
    const created = { _id: "d1", name: "Dr A" };

    const createSpy = jest
      .spyOn(DoctorRepository.prototype, "create")
      .mockResolvedValue(created as any);

    const result = await createDoctorService({
      name: "Dr A",
      specialization: "Cardio",
      fee: 100,
    });

    expect(createSpy).toHaveBeenCalledWith({
      name: "Dr A",
      specialization: "Cardio",
      fee: 100,
    });
    expect(result).toEqual(created);
  });

  test("getDoctorsService -> calls repo.findAll", async () => {
    const list = [{ _id: "d1" }, { _id: "d2" }];

    const findAllSpy = jest
      .spyOn(DoctorRepository.prototype, "findAll")
      .mockResolvedValue(list as any);

    const result = await getDoctorsService();

    expect(findAllSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(list);
  });

  test("getDoctorByIdService -> throws 404 if not found", async () => {
    jest
      .spyOn(DoctorRepository.prototype, "findById")
      .mockResolvedValue(null as any);

    await expect(getDoctorByIdService("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Doctor not found",
      })
    );
  });

  test("getDoctorByIdService -> returns doctor if found", async () => {
    const doctor = { _id: "d1", name: "Dr A" };

    const findByIdSpy = jest
      .spyOn(DoctorRepository.prototype, "findById")
      .mockResolvedValue(doctor as any);

    const result = await getDoctorByIdService("d1");

    expect(findByIdSpy).toHaveBeenCalledWith("d1");
    expect(result).toEqual(doctor);
  });

  test("updateDoctorService -> throws 404 if not found", async () => {
    jest
      .spyOn(DoctorRepository.prototype, "updateById")
      .mockResolvedValue(null as any);

    await expect(updateDoctorService("x", { fee: 200 })).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Doctor not found",
      })
    );
  });

  test("updateDoctorService -> returns updated doctor", async () => {
    const updated = { _id: "d1", fee: 200 };

    const updateSpy = jest
      .spyOn(DoctorRepository.prototype, "updateById")
      .mockResolvedValue(updated as any);

    const result = await updateDoctorService("d1", { fee: 200 });

    expect(updateSpy).toHaveBeenCalledWith("d1", { fee: 200 });
    expect(result).toEqual(updated);
  });

  test("deleteDoctorService -> throws 404 if not found", async () => {
    jest
      .spyOn(DoctorRepository.prototype, "deleteById")
      .mockResolvedValue(null as any);

    await expect(deleteDoctorService("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Doctor not found",
      })
    );
  });

  test("deleteDoctorService -> returns deleted doctor", async () => {
    const deleted = { _id: "d1" };

    const delSpy = jest
      .spyOn(DoctorRepository.prototype, "deleteById")
      .mockResolvedValue(deleted as any);

    const result = await deleteDoctorService("d1");

    expect(delSpy).toHaveBeenCalledWith("d1");
    expect(result).toEqual(deleted);
  });
});