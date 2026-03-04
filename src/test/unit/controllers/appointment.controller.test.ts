import { AppointmentController } from "../../../controllers/appointment.controller";
import { AppointmentService } from "../../../services/appointment.service";


const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AppointmentController (unit)", () => {
  let controller: AppointmentController;

  beforeEach(() => {
    controller = new AppointmentController();
    jest.restoreAllMocks();
  });

  // -------------------------
  // create()
  // -------------------------
  test("create -> should create appointment (201)", async () => {
    const appt = { _id: "a1" };

    const spy = jest
      .spyOn(AppointmentService.prototype, "createAppointment")
      .mockResolvedValue(appt as any);

    const req: any = {
      user: { _id: "u1" },
      body: { doctorId: "d1", date: "2026-03-10" },
    };
    const res = mockRes();

    await controller.create(req, res as any);

    expect(spy).toHaveBeenCalledWith("u1", req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, appointment: appt });
  });

  test("create -> should handle error (statusCode)", async () => {
    const err: any = new Error("Invalid");
    err.statusCode = 400;

    jest
      .spyOn(AppointmentService.prototype, "createAppointment")
      .mockRejectedValue(err);

    const req: any = { user: { _id: "u1" }, body: {} };
    const res = mockRes();

    await controller.create(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid" });
  });

  // -------------------------
  // myAppointments()
  // -------------------------
  test("myAppointments -> should return user's appointments", async () => {
    const list = [{ _id: "a1" }, { _id: "a2" }];

    const spy = jest
      .spyOn(AppointmentService.prototype, "getMyAppointments")
      .mockResolvedValue(list as any);

    const req: any = { user: { _id: "u1" } };
    const res = mockRes();

    await controller.myAppointments(req, res as any);

    expect(spy).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalledWith({ success: true, appointments: list });
  });

  test("myAppointments -> should handle error (500 default)", async () => {
    jest
      .spyOn(AppointmentService.prototype, "getMyAppointments")
      .mockRejectedValue(new Error("Boom"));

    const req: any = { user: { _id: "u1" } };
    const res = mockRes();

    await controller.myAppointments(req, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Boom" });
  });

  // -------------------------
  // getById()
  // -------------------------
  test("getById -> should return appointment by id", async () => {
    const appt = { _id: "a1" };

    const spy = jest
      .spyOn(AppointmentService.prototype, "getMyAppointmentById")
      .mockResolvedValue(appt as any);

    const req: any = { user: { _id: "u1" }, params: { id: "a1" } };
    const res = mockRes();

    await controller.getById(req, res as any);

    expect(spy).toHaveBeenCalledWith("u1", "a1");
    expect(res.json).toHaveBeenCalledWith({ success: true, appointment: appt });
  });

  test("getById -> should handle error", async () => {
    const err: any = new Error("Not found");
    err.statusCode = 404;

    jest
      .spyOn(AppointmentService.prototype, "getMyAppointmentById")
      .mockRejectedValue(err);

    const req: any = { user: { _id: "u1" }, params: { id: "missing" } };
    const res = mockRes();

    await controller.getById(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Not found" });
  });

  // -------------------------
  // cancel()
  // -------------------------
  test("cancel -> should cancel appointment", async () => {
    const cancelled = { _id: "a1", status: "CANCELLED" };

    const spy = jest
      .spyOn(AppointmentService.prototype, "cancelMyAppointment")
      .mockResolvedValue(cancelled as any);

    const req: any = {
      user: { _id: "u1" },
      params: { id: "a1" },
      body: { reason: "busy" },
    };
    const res = mockRes();

    await controller.cancel(req, res as any);

    expect(spy).toHaveBeenCalledWith("u1", "a1", req.body);
    expect(res.json).toHaveBeenCalledWith({ success: true, appointment: cancelled });
  });

  test("cancel -> should handle error (statusCode)", async () => {
    const err: any = new Error("Cannot cancel");
    err.statusCode = 400;

    jest
      .spyOn(AppointmentService.prototype, "cancelMyAppointment")
      .mockRejectedValue(err);

    const req: any = { user: { _id: "u1" }, params: { id: "a1" }, body: {} };
    const res = mockRes();

    await controller.cancel(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Cannot cancel" });
  });
});