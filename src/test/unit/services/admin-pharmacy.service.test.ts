import {
  createMedicineService,
  getMedicinesService,
  getMedicineByIdService,
  updateMedicineService,
  deleteMedicineService,
} from "../../../services/admin/pharmacy.service";

import { PharmacyRepository } from "../../../repositories/pharmacy.repository";

describe("AdminPharmacyService (unit)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("createMedicineService -> throws 400 if required fields missing", async () => {
    await expect(createMedicineService({} as any)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "name, price and stock are required",
      })
    );
  });

  test("createMedicineService -> throws 400 if price < 0", async () => {
    await expect(
      createMedicineService({
        name: "Paracetamol",
        price: -1,
        stock: 10,
      })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "price must be >= 0",
      })
    );
  });

  test("createMedicineService -> throws 400 if stock < 0", async () => {
    await expect(
      createMedicineService({
        name: "Paracetamol",
        price: 10,
        stock: -5,
      })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "stock must be >= 0",
      })
    );
  });

  test("createMedicineService -> calls repo.create when valid", async () => {
    const spy = jest
      .spyOn(PharmacyRepository.prototype, "create")
      .mockResolvedValue({ _id: "m1" } as any);

    const result = await createMedicineService({
      name: "Paracetamol",
      price: 10,
      stock: 50,
    });

    expect(spy).toHaveBeenCalledWith({
      name: "Paracetamol",
      price: 10,
      stock: 50,
    });

    expect(result).toEqual({ _id: "m1" });
  });

  test("getMedicinesService -> returns medicines list", async () => {
    const spy = jest
      .spyOn(PharmacyRepository.prototype, "findAll")
      .mockResolvedValue([{ _id: "m1" }] as any);

    const result = await getMedicinesService();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ _id: "m1" }]);
  });

  test("getMedicineByIdService -> throws 404 if not found", async () => {
    jest
      .spyOn(PharmacyRepository.prototype, "findById")
      .mockResolvedValue(null as any);

    await expect(getMedicineByIdService("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Medicine not found",
      })
    );
  });

  test("getMedicineByIdService -> returns medicine if found", async () => {
    const medicine = { _id: "m1", name: "Paracetamol" };

    const spy = jest
      .spyOn(PharmacyRepository.prototype, "findById")
      .mockResolvedValue(medicine as any);

    const result = await getMedicineByIdService("m1");

    expect(spy).toHaveBeenCalledWith("m1");
    expect(result).toEqual(medicine);
  });

  test("updateMedicineService -> throws 404 if not found", async () => {
    jest
      .spyOn(PharmacyRepository.prototype, "updateById")
      .mockResolvedValue(null as any);

    await expect(updateMedicineService("x", { stock: 10 })).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Medicine not found",
      })
    );
  });

  test("updateMedicineService -> returns updated medicine", async () => {
    const updated = { _id: "m1", stock: 20 };

    const spy = jest
      .spyOn(PharmacyRepository.prototype, "updateById")
      .mockResolvedValue(updated as any);

    const result = await updateMedicineService("m1", { stock: 20 });

    expect(spy).toHaveBeenCalledWith("m1", { stock: 20 });
    expect(result).toEqual(updated);
  });

  test("deleteMedicineService -> throws 404 if not found", async () => {
    jest
      .spyOn(PharmacyRepository.prototype, "deleteById")
      .mockResolvedValue(null as any);

    await expect(deleteMedicineService("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Medicine not found",
      })
    );
  });

  test("deleteMedicineService -> returns deleted medicine", async () => {
    const deleted = { _id: "m1" };

    const spy = jest
      .spyOn(PharmacyRepository.prototype, "deleteById")
      .mockResolvedValue(deleted as any);

    const result = await deleteMedicineService("m1");

    expect(spy).toHaveBeenCalledWith("m1");
    expect(result).toEqual(deleted);
  });
});