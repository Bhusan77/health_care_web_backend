import { AdminAppointmentController } from "../../../controllers/admin/appointment.controller";
import { AdminAppointmentService } from "../../../services/admin/appointment.service";

type MockRes = {
  status: jest.Mock;
  json: jest.Mock;
};

const mockRes = (): MockRes => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AdminAppointmentController (unit)", () => {
  let controller: AdminAppointmentController;

  beforeEach(() => {
    controller = new AdminAppointmentController();
    jest.restoreAllMocks(); // reset spies between tests
  });

  describe("all()", () => {
    test("should return appointments list", async () => {
      const list = [{ _id: "1" }, { _id: "2" }];

      const spy = jest
        .spyOn(AdminAppointmentService.prototype, "getAllAppointments")
        .mockResolvedValue(list as any);

      const req: any = { query: { page: "1" } };
      const res = mockRes();

      await controller.all(req, res as any);

      expect(spy).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({ success: true, appointments: list });
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should handle error with statusCode", async () => {
      const err: any = new Error("Boom");
      err.statusCode = 400;

      jest
        .spyOn(AdminAppointmentService.prototype, "getAllAppointments")
        .mockRejectedValue(err);

      const req: any = { query: {} };
      const res = mockRes();

      await controller.all(req, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Boom",
      });
    });

    test("should handle error without statusCode (500)", async () => {
      jest
        .spyOn(AdminAppointmentService.prototype, "getAllAppointments")
        .mockRejectedValue(new Error("Internal"));

      const req: any = { query: {} };
      const res = mockRes();

      await controller.all(req, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal",
      });
    });
  });

  describe("getById()", () => {
    test("should return appointment by id", async () => {
      const appt = { _id: "abc" };

      const spy = jest
        .spyOn(AdminAppointmentService.prototype, "getAppointmentById")
        .mockResolvedValue(appt as any);

      const req: any = { params: { id: "abc" } };
      const res = mockRes();

      await controller.getById(req, res as any);

      expect(spy).toHaveBeenCalledWith("abc");
      expect(res.json).toHaveBeenCalledWith({ success: true, appointment: appt });
    });

    test("should handle error", async () => {
      const err: any = new Error("Not found");
      err.statusCode = 404;

      jest
        .spyOn(AdminAppointmentService.prototype, "getAppointmentById")
        .mockRejectedValue(err);

      const req: any = { params: { id: "missing" } };
      const res = mockRes();

      await controller.getById(req, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Not found",
      });
    });
  });

  describe("updateStatus()", () => {
    test("should update status", async () => {
      const updated = { _id: "1", status: "CONFIRMED" };

      const spy = jest
        .spyOn(AdminAppointmentService.prototype, "updateStatus")
        .mockResolvedValue(updated as any);

      const req: any = { params: { id: "1" }, body: { status: "CONFIRMED" } };
      const res = mockRes();

      await controller.updateStatus(req, res as any);

      expect(spy).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith({ success: true, appointment: updated });
    });

    test("should handle error", async () => {
      const err: any = new Error("Invalid status");
      err.statusCode = 400;

      jest
        .spyOn(AdminAppointmentService.prototype, "updateStatus")
        .mockRejectedValue(err);

      const req: any = { params: { id: "1" }, body: { status: "WRONG" } };
      const res = mockRes();

      await controller.updateStatus(req, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid status",
      });
    });
  });

  describe("reschedule()", () => {
    test("should reschedule appointment", async () => {
      const updated = { _id: "1", date: "2026-03-10", time: "10:00" };

      const spy = jest
        .spyOn(AdminAppointmentService.prototype, "reschedule")
        .mockResolvedValue(updated as any);

      const req: any = {
        params: { id: "1" },
        body: { date: "2026-03-10", time: "10:00" },
      };
      const res = mockRes();

      await controller.reschedule(req, res as any);

      expect(spy).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith({ success: true, appointment: updated });
    });

    test("should handle error", async () => {
      const err: any = new Error("Reschedule not allowed");
      err.statusCode = 403;

      jest
        .spyOn(AdminAppointmentService.prototype, "reschedule")
        .mockRejectedValue(err);

      const req: any = { params: { id: "1" }, body: {} };
      const res = mockRes();

      await controller.reschedule(req, res as any);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Reschedule not allowed",
      });
    });
  });
});