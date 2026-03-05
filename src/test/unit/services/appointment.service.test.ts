import { AppointmentService } from "../../../services/appointment.service";
import { AppointmentRepository } from "../../../repositories/appointment.repository";
import { DoctorModel } from "../../../models/doctor.model";

jest.mock("../../../models/doctor.model", () => ({
  DoctorModel: {
    findById: jest.fn(),
  },
}));

describe("AppointmentService (unit)", () => {
  let service: AppointmentService;

  beforeEach(() => {
    service = new AppointmentService();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // -------------------------
  // createAppointment
  // -------------------------
  test("createAppointment -> throws 400 if doctor missing", async () => {
    await expect(
      service.createAppointment("p1", {
        doctor: "",
        date: "2026-01-01",
        time: "10:00",
        reason: "checkup",
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({ statusCode: 400, message: "Doctor is required" })
    );
  });

  test("createAppointment -> throws 400 if invalid date format", async () => {
    await expect(
      service.createAppointment("p1", {
        doctor: "d1",
        date: "01-01-2026",
        time: "10:00",
        reason: "checkup",
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid date format (YYYY-MM-DD)",
      })
    );
  });

  test("createAppointment -> throws 400 if invalid time format", async () => {
    await expect(
      service.createAppointment("p1", {
        doctor: "d1",
        date: "2026-01-01",
        time: "10",
        reason: "checkup",
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid time format (HH:mm)",
      })
    );
  });

  test("createAppointment -> throws 404 if doctor not found", async () => {
    (DoctorModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createAppointment("p1", {
        doctor: "d1",
        date: "2026-01-01",
        time: "10:00",
        reason: "checkup",
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({ statusCode: 404, message: "Doctor not found" })
    );
  });

  test("createAppointment -> throws 409 if slot already booked", async () => {
    (DoctorModel.findById as jest.Mock).mockResolvedValue({ _id: "d1" });

    jest
      .spyOn(AppointmentRepository.prototype, "findSameSlot")
      .mockResolvedValue({ _id: "aExisting" } as any);

    await expect(
      service.createAppointment("p1", {
        doctor: "d1",
        date: "2026-01-01",
        time: "10:00",
        reason: "checkup",
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: "This slot is already booked",
      })
    );
  });

  test("createAppointment -> success creates appointment (status PENDING)", async () => {
    (DoctorModel.findById as jest.Mock).mockResolvedValue({ _id: "d1" });

    jest
      .spyOn(AppointmentRepository.prototype, "findSameSlot")
      .mockResolvedValue(null as any);

    const createSpy = jest
      .spyOn(AppointmentRepository.prototype, "create")
      .mockResolvedValue({ _id: "a1", status: "PENDING" } as any);

    const result = await service.createAppointment("p1", {
      doctor: "d1",
      date: "2026-01-01",
      time: " 10:00 ", // test trimming works
      reason: "checkup",
    } as any);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        patient: "p1",
        doctor: "d1",
        date: "2026-01-01",
        time: "10:00",
        reason: "checkup",
        status: "PENDING",
      })
    );

    expect(result).toEqual({ _id: "a1", status: "PENDING" });
  });

  // -------------------------
  // getMyAppointments
  // -------------------------
  test("getMyAppointments -> calls repo.findMine", async () => {
    const spy = jest
      .spyOn(AppointmentRepository.prototype, "findMine")
      .mockResolvedValue([{ _id: "a1" }] as any);

    const result = await service.getMyAppointments("p1");

    expect(spy).toHaveBeenCalledWith("p1");
    expect(result).toEqual([{ _id: "a1" }]);
  });

  // -------------------------
  // getMyAppointmentById
  // -------------------------
  test("getMyAppointmentById -> throws 404 if appointment not found", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findByIdPopulate")
      .mockResolvedValue(null as any);

    await expect(service.getMyAppointmentById("p1", "a1")).rejects.toEqual(
      expect.objectContaining({ statusCode: 404, message: "Appointment not found" })
    );
  });

  test("getMyAppointmentById -> throws 403 if not owner", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findByIdPopulate")
      .mockResolvedValue({ _id: "a1", patient: "p2" } as any);

    await expect(service.getMyAppointmentById("p1", "a1")).rejects.toEqual(
      expect.objectContaining({ statusCode: 403, message: "Forbidden" })
    );
  });

  test("getMyAppointmentById -> success returns appointment", async () => {
    const appt = { _id: "a1", patient: { _id: "p1" } };

    const spy = jest
      .spyOn(AppointmentRepository.prototype, "findByIdPopulate")
      .mockResolvedValue(appt as any);

    const result = await service.getMyAppointmentById("p1", "a1");

    expect(spy).toHaveBeenCalledWith("a1");
    expect(result).toEqual(appt);
  });

  // -------------------------
  // cancelMyAppointment
  // -------------------------
  test("cancelMyAppointment -> throws 404 if appointment not found", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue(null as any);

    await expect(service.cancelMyAppointment("p1", "a1", {} as any)).rejects.toEqual(
      expect.objectContaining({ statusCode: 404, message: "Appointment not found" })
    );
  });

  test("cancelMyAppointment -> throws 403 if not owner", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", patient: "p2", status: "PENDING" } as any);

    await expect(
      service.cancelMyAppointment("p1", "a1", { cancelReason: "x" } as any)
    ).rejects.toEqual(expect.objectContaining({ statusCode: 403, message: "Forbidden" }));
  });

  test("cancelMyAppointment -> throws 400 if already cancelled", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", patient: "p1", status: "CANCELLED" } as any);

    await expect(service.cancelMyAppointment("p1", "a1", {} as any)).rejects.toEqual(
      expect.objectContaining({ statusCode: 400, message: "Already cancelled" })
    );
  });

  test("cancelMyAppointment -> throws 400 if completed", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", patient: "p1", status: "COMPLETED" } as any);

    await expect(service.cancelMyAppointment("p1", "a1", {} as any)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Cannot cancel completed appointment",
      })
    );
  });

  test("cancelMyAppointment -> success updates status CANCELLED with default reason", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", patient: "p1", status: "PENDING" } as any);

    const updateSpy = jest
      .spyOn(AppointmentRepository.prototype, "updateById")
      .mockResolvedValue({ _id: "a1", status: "CANCELLED" } as any);

    const result = await service.cancelMyAppointment("p1", "a1", {} as any);

    expect(updateSpy).toHaveBeenCalledWith("a1", {
      status: "CANCELLED",
      cancelReason: "Cancelled by user",
    });

    expect(result).toEqual({ _id: "a1", status: "CANCELLED" });
  });

  test("cancelMyAppointment -> success uses custom cancelReason", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", patient: "p1", status: "PENDING" } as any);

    const updateSpy = jest
      .spyOn(AppointmentRepository.prototype, "updateById")
      .mockResolvedValue({ _id: "a1", status: "CANCELLED" } as any);

    await service.cancelMyAppointment("p1", "a1", { cancelReason: "Not coming" } as any);

    expect(updateSpy).toHaveBeenCalledWith("a1", {
      status: "CANCELLED",
      cancelReason: "Not coming",
    });
  });
});