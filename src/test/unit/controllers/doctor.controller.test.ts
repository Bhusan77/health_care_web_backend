import { getDoctorById, getDoctors } from "../../../controllers/doctor.controller";
import * as DoctorService from "../../services/doctor.service";

// ✅ mock service module
jest.mock("../../services/doctor.service", () => ({
  getDoctorsService: jest.fn(),
  getDoctorByIdService: jest.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Doctor Controller (public) - unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // getDoctors
  // -------------------------
  test("getDoctors -> should call getDoctorsService(q, specialization) and return doctors", async () => {
    const doctors = [{ _id: "1" }, { _id: "2" }];
    (DoctorService.getDoctorsService as jest.Mock).mockResolvedValue(doctors);

    const req: any = {
      query: { q: "ram", specialization: "cardiology" },
    };
    const res = mockRes();

    await getDoctors(req, res);

    expect(DoctorService.getDoctorsService).toHaveBeenCalledWith("ram", "cardiology");
    expect(res.json).toHaveBeenCalledWith({ success: true, doctors });
    expect(res.status).not.toHaveBeenCalled();
  });

  test("getDoctors -> should work even if query is empty", async () => {
    const doctors = [{ _id: "1" }];
    (DoctorService.getDoctorsService as jest.Mock).mockResolvedValue(doctors);

    const req: any = { query: {} };
    const res = mockRes();

    await getDoctors(req, res);

    expect(DoctorService.getDoctorsService).toHaveBeenCalledWith(undefined, undefined);
    expect(res.json).toHaveBeenCalledWith({ success: true, doctors });
  });

  test("getDoctors -> should handle error with statusCode", async () => {
    const err: any = new Error("Bad request");
    err.statusCode = 400;

    (DoctorService.getDoctorsService as jest.Mock).mockRejectedValue(err);

    const req: any = { query: { q: "x" } };
    const res = mockRes();

    await getDoctors(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Bad request",
    });
  });

  test("getDoctors -> should handle error without statusCode (500)", async () => {
    (DoctorService.getDoctorsService as jest.Mock).mockRejectedValue(
      new Error("Boom")
    );

    const req: any = { query: {} };
    const res = mockRes();

    await getDoctors(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Boom",
    });
  });

  // -------------------------
  // getDoctorById
  // -------------------------
  test("getDoctorById -> should call getDoctorByIdService(id) and return doctor", async () => {
    const doctor = { _id: "abc", name: "Dr X" };
    (DoctorService.getDoctorByIdService as jest.Mock).mockResolvedValue(doctor);

    const req: any = { params: { id: "abc" } };
    const res = mockRes();

    await getDoctorById(req, res);

    expect(DoctorService.getDoctorByIdService).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({ success: true, doctor });
  });

  test("getDoctorById -> should handle error", async () => {
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
});