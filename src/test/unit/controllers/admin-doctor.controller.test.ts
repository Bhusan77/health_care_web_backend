import { createDoctor, deleteDoctor, getDoctorById, getDoctors, updateDoctor } from "../../../controllers/admin/doctor.controller";
import * as DoctorService from "../../services/admin/doctor.service";

// ✅ mock service module (no DB call)
jest.mock("../../services/admin/doctor.service", () => ({
  createDoctorService: jest.fn(),
  getDoctorsService: jest.fn(),
  getDoctorByIdService: jest.fn(),
  updateDoctorService: jest.fn(),
  deleteDoctorService: jest.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Admin Doctor Controller (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // createDoctor
  // -------------------------
  test("createDoctor -> returns 201 + doctor", async () => {
    const doctor = { _id: "1", name: "Dr A" };
    (DoctorService.createDoctorService as jest.Mock).mockResolvedValue(doctor);

    const req: any = { body: { name: "Dr A" } };
    const res = mockRes();

    await createDoctor(req, res);

    expect(DoctorService.createDoctorService).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  });

  test("createDoctor -> error uses statusCode", async () => {
    const err: any = new Error("Validation error");
    err.statusCode = 400;
    (DoctorService.createDoctorService as jest.Mock).mockRejectedValue(err);

    const req: any = { body: {} };
    const res = mockRes();

    await createDoctor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation error",
    });
  });

  test("createDoctor -> error without statusCode defaults 500", async () => {
    (DoctorService.createDoctorService as jest.Mock).mockRejectedValue(
      new Error("Boom")
    );

    const req: any = { body: {} };
    const res = mockRes();

    await createDoctor(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Boom",
    });
  });

  // -------------------------
  // getDoctors
  // -------------------------
  test("getDoctors -> returns doctors list", async () => {
    const doctors = [{ _id: "1" }, { _id: "2" }];
    (DoctorService.getDoctorsService as jest.Mock).mockResolvedValue(doctors);

    const req: any = {};
    const res = mockRes();

    await getDoctors(req, res);

    expect(DoctorService.getDoctorsService).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: doctors,
    });
  });

  test("getDoctors -> handles error", async () => {
    const err: any = new Error("Service error");
    err.statusCode = 503;
    (DoctorService.getDoctorsService as jest.Mock).mockRejectedValue(err);

    const req: any = {};
    const res = mockRes();

    await getDoctors(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Service error",
    });
  });

  // -------------------------
  // getDoctorById
  // -------------------------
  test("getDoctorById -> returns doctor", async () => {
    const doctor = { _id: "abc", name: "Dr X" };
    (DoctorService.getDoctorByIdService as jest.Mock).mockResolvedValue(doctor);

    const req: any = { params: { id: "abc" } };
    const res = mockRes();

    await getDoctorById(req, res);

    expect(DoctorService.getDoctorByIdService).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: doctor,
    });
  });

  test("getDoctorById -> handles error", async () => {
    const err: any = new Error("Doctor not found");
    err.statusCode = 404;
    (DoctorService.getDoctorByIdService as jest.Mock).mockRejectedValue(err);

    const req: any = { params: { id: "missing" } };
    const res = mockRes();

    await getDoctorById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Doctor not found",
    });
  });

  // -------------------------
  // updateDoctor
  // -------------------------
  test("updateDoctor -> returns updated doctor", async () => {
    const updated = { _id: "1", fee: 500 };
    (DoctorService.updateDoctorService as jest.Mock).mockResolvedValue(updated);

    const req: any = { params: { id: "1" }, body: { fee: 500 } };
    const res = mockRes();

    await updateDoctor(req, res);

    expect(DoctorService.updateDoctorService).toHaveBeenCalledWith("1", req.body);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Doctor updated successfully",
      data: updated,
    });
  });

  test("updateDoctor -> handles error", async () => {
    const err: any = new Error("Update failed");
    err.statusCode = 400;
    (DoctorService.updateDoctorService as jest.Mock).mockRejectedValue(err);

    const req: any = { params: { id: "1" }, body: {} };
    const res = mockRes();

    await updateDoctor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Update failed",
    });
  });

  // -------------------------
  // deleteDoctor
  // -------------------------
  test("deleteDoctor -> returns success + null data", async () => {
    (DoctorService.deleteDoctorService as jest.Mock).mockResolvedValue(undefined);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await deleteDoctor(req, res);

    expect(DoctorService.deleteDoctorService).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Doctor deleted successfully",
      data: null,
    });
  });

  test("deleteDoctor -> handles error", async () => {
    const err: any = new Error("Cannot delete");
    err.statusCode = 400;
    (DoctorService.deleteDoctorService as jest.Mock).mockRejectedValue(err);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await deleteDoctor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot delete",
    });
  });
});