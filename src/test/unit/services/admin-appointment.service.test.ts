import { AdminAppointmentService } from "../../../services/admin/appointment.service";
import { AppointmentRepository } from "../../../repositories/appointment.repository";
import { HttpError } from "../../../errors/http-error";

// ✅ no need to mock the whole module, just spy prototype methods
describe("AdminAppointmentService (unit)", () => {
  let service: AdminAppointmentService;

  beforeEach(() => {
    service = new AdminAppointmentService();
    jest.restoreAllMocks();
  });

  test("getAllAppointments -> builds filters correctly", async () => {
    const findAllSpy = jest
      .spyOn(AppointmentRepository.prototype, "findAll")
      .mockResolvedValue([{ _id: "a1" }] as any);

    const result = await service.getAllAppointments({
      status: "CONFIRMED",
      doctor: "d1",
      patient: "p1",
      date: "2026-01-01",
    });

    expect(findAllSpy).toHaveBeenCalledWith({
      status: "CONFIRMED",
      doctor: "d1",
      patient: "p1",
      date: "2026-01-01",
    });

    expect(result).toEqual([{ _id: "a1" }]);
  });

  test("getAllAppointments -> empty query passes empty filters", async () => {
    const findAllSpy = jest
      .spyOn(AppointmentRepository.prototype, "findAll")
      .mockResolvedValue([] as any);

    await service.getAllAppointments({});

    expect(findAllSpy).toHaveBeenCalledWith({});
  });

  test("getAppointmentById -> throws 404 if not found", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findByIdPopulate")
      .mockResolvedValue(null as any);

    await expect(service.getAppointmentById("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Appointment not found",
      })
    );
  });

  test("getAppointmentById -> returns appointment if found", async () => {
    const appt = { _id: "a1" };

    jest
      .spyOn(AppointmentRepository.prototype, "findByIdPopulate")
      .mockResolvedValue(appt as any);

    const result = await service.getAppointmentById("a1");

    expect(result).toEqual(appt);
  });

  test("updateStatus -> throws 404 if appointment not found", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue(null as any);

    await expect(
      service.updateStatus("a1", { status: "CONFIRMED", note: "x" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Appointment not found",
      })
    );
  });

  test("updateStatus -> throws 400 for invalid status", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1" } as any);

    await expect(
      service.updateStatus("a1", { status: "PENDING", note: "x" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid status update",
      })
    );
  });

  test("updateStatus -> updates status + adminNote", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1" } as any);

    const updateSpy = jest
      .spyOn(AppointmentRepository.prototype, "updateById")
      .mockResolvedValue({ _id: "a1", status: "CONFIRMED" } as any);

    const result = await service.updateStatus("a1", {
      status: "CONFIRMED",
      note: "ok",
    } as any);

    expect(updateSpy).toHaveBeenCalledWith("a1", {
      status: "CONFIRMED",
      adminNote: "ok",
    });

    expect(result).toEqual({ _id: "a1", status: "CONFIRMED" });
  });

  test("reschedule -> throws 404 if appointment not found", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue(null as any);

    await expect(
      service.reschedule("a1", { date: "2026-01-01", time: "10:00" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Appointment not found",
      })
    );
  });

  test("reschedule -> throws 400 if CANCELLED", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", status: "CANCELLED" } as any);

    await expect(
      service.reschedule("a1", { date: "2026-01-01", time: "10:00" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Cannot reschedule cancelled appointment",
      })
    );
  });

  test("reschedule -> throws 400 if COMPLETED", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", status: "COMPLETED" } as any);

    await expect(
      service.reschedule("a1", { date: "2026-01-01", time: "10:00" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Cannot reschedule completed appointment",
      })
    );
  });

  test("reschedule -> throws 400 invalid date format", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", status: "CONFIRMED" } as any);

    await expect(
      service.reschedule("a1", { date: "01-01-2026", time: "10:00" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid date format (YYYY-MM-DD)",
      })
    );
  });

  test("reschedule -> throws 400 invalid time format", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", status: "CONFIRMED" } as any);

    await expect(
      service.reschedule("a1", { date: "2026-01-01", time: "10" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid time format (HH:mm)",
      })
    );
  });

  test("reschedule -> throws 409 if slot already booked by another appointment", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", doctor: "d1", status: "CONFIRMED" } as any);

    jest
      .spyOn(AppointmentRepository.prototype, "findSameSlot")
      .mockResolvedValue({ _id: "a2" } as any);

    await expect(
      service.reschedule("a1", { date: "2026-01-01", time: "10:00" } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: "This slot is already booked",
      })
    );
  });

  test("reschedule -> success (no overlap)", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", doctor: "d1", status: "CONFIRMED" } as any);

    const sameSlotSpy = jest
      .spyOn(AppointmentRepository.prototype, "findSameSlot")
      .mockResolvedValue(null as any);

    const updateSpy = jest
      .spyOn(AppointmentRepository.prototype, "updateById")
      .mockResolvedValue({ _id: "a1", date: "2026-01-02", time: "11:00" } as any);

    const result = await service.reschedule("a1", {
      date: "2026-01-02",
      time: "11:00",
      note: "moved",
    } as any);

    expect(sameSlotSpy).toHaveBeenCalledWith("d1", "2026-01-02", "11:00");
    expect(updateSpy).toHaveBeenCalledWith("a1", {
      date: "2026-01-02",
      time: "11:00",
      adminNote: "moved",
    });

    expect(result).toEqual({ _id: "a1", date: "2026-01-02", time: "11:00" });
  });

  test("reschedule -> allows overlap if same appointment id", async () => {
    jest
      .spyOn(AppointmentRepository.prototype, "findById")
      .mockResolvedValue({ _id: "a1", doctor: "d1", status: "CONFIRMED" } as any);

    jest
      .spyOn(AppointmentRepository.prototype, "findSameSlot")
      .mockResolvedValue({ _id: "a1" } as any);

    const updateSpy = jest
      .spyOn(AppointmentRepository.prototype, "updateById")
      .mockResolvedValue({ _id: "a1" } as any);

    await service.reschedule("a1", {
      date: "2026-01-02",
      time: "11:00",
      note: "ok",
    } as any);

    expect(updateSpy).toHaveBeenCalled();
  });
});