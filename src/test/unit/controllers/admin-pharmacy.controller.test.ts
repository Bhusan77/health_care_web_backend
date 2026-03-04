

import { createMedicine, deleteMedicine, getMedicineById, getMedicines, updateMedicine } from "../../../controllers/admin/pharmacy.controller";
import * as PharmacyService from "../../services/admin/pharmacy.service";

// ✅ mock service module
jest.mock("../../services/admin/pharmacy.service", () => ({
  createMedicineService: jest.fn(),
  getMedicinesService: jest.fn(),
  getMedicineByIdService: jest.fn(),
  updateMedicineService: jest.fn(),
  deleteMedicineService: jest.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Admin Pharmacy Controller (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // createMedicine
  // -------------------------
  test("createMedicine -> returns 201 + medicine", async () => {
    const medicine = { _id: "1", name: "Paracetamol" };
    (PharmacyService.createMedicineService as jest.Mock).mockResolvedValue(medicine);

    const req: any = { body: { name: "Paracetamol" } };
    const res = mockRes();

    await createMedicine(req, res);

    expect(PharmacyService.createMedicineService).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Medicine created successfully",
      medicine,
    });
  });

  test("createMedicine -> handles error statusCode", async () => {
    const err: any = new Error("Validation error");
    err.statusCode = 400;
    (PharmacyService.createMedicineService as jest.Mock).mockRejectedValue(err);

    const req: any = { body: {} };
    const res = mockRes();

    await createMedicine(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation error",
    });
  });

  test("createMedicine -> error without statusCode defaults 500", async () => {
    (PharmacyService.createMedicineService as jest.Mock).mockRejectedValue(
      new Error("Boom")
    );

    const req: any = { body: {} };
    const res = mockRes();

    await createMedicine(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Boom",
    });
  });

  // -------------------------
  // getMedicines
  // -------------------------
  test("getMedicines -> returns medicines list", async () => {
    const medicines = [{ _id: "1" }, { _id: "2" }];
    (PharmacyService.getMedicinesService as jest.Mock).mockResolvedValue(medicines);

    const req: any = {};
    const res = mockRes();

    await getMedicines(req, res);

    expect(PharmacyService.getMedicinesService).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      medicines,
    });
  });

  test("getMedicines -> handles error", async () => {
    const err: any = new Error("Service error");
    err.statusCode = 503;
    (PharmacyService.getMedicinesService as jest.Mock).mockRejectedValue(err);

    const req: any = {};
    const res = mockRes();

    await getMedicines(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Service error",
    });
  });

  // -------------------------
  // getMedicineById
  // -------------------------
  test("getMedicineById -> returns medicine", async () => {
    const medicine = { _id: "abc", name: "Cough Syrup" };
    (PharmacyService.getMedicineByIdService as jest.Mock).mockResolvedValue(medicine);

    const req: any = { params: { id: "abc" } };
    const res = mockRes();

    await getMedicineById(req, res);

    expect(PharmacyService.getMedicineByIdService).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      medicine,
    });
  });

  test("getMedicineById -> handles error", async () => {
    const err: any = new Error("Medicine not found");
    err.statusCode = 404;
    (PharmacyService.getMedicineByIdService as jest.Mock).mockRejectedValue(err);

    const req: any = { params: { id: "missing" } };
    const res = mockRes();

    await getMedicineById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Medicine not found",
    });
  });

  // -------------------------
  // updateMedicine
  // -------------------------
  test("updateMedicine -> returns updated medicine", async () => {
    const updated = { _id: "1", price: 20 };
    (PharmacyService.updateMedicineService as jest.Mock).mockResolvedValue(updated);

    const req: any = { params: { id: "1" }, body: { price: 20 } };
    const res = mockRes();

    await updateMedicine(req, res);

    expect(PharmacyService.updateMedicineService).toHaveBeenCalledWith("1", req.body);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Medicine updated successfully",
      medicine: updated,
    });
  });

  test("updateMedicine -> handles error", async () => {
    const err: any = new Error("Update failed");
    err.statusCode = 400;
    (PharmacyService.updateMedicineService as jest.Mock).mockRejectedValue(err);

    const req: any = { params: { id: "1" }, body: {} };
    const res = mockRes();

    await updateMedicine(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Update failed",
    });
  });

  // -------------------------
  // deleteMedicine
  // -------------------------
  test("deleteMedicine -> returns success message", async () => {
    (PharmacyService.deleteMedicineService as jest.Mock).mockResolvedValue(undefined);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await deleteMedicine(req, res);

    expect(PharmacyService.deleteMedicineService).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Medicine deleted successfully",
    });
  });

  test("deleteMedicine -> handles error", async () => {
    const err: any = new Error("Cannot delete");
    err.statusCode = 400;
    (PharmacyService.deleteMedicineService as jest.Mock).mockRejectedValue(err);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await deleteMedicine(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot delete",
    });
  });
});