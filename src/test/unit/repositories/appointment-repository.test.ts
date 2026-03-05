import mongoose from "mongoose";
import { AppointmentRepository } from "../../../repositories/appointment.repository";
import { AppointmentModel } from "../../../models/appointment.model";

// ✅ Mock AppointmentModel (mongoose model)
jest.mock("../../../models/appointment.model", () => ({
  AppointmentModel: {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe("AppointmentRepository (unit)", () => {
  let repo: AppointmentRepository;

  // reusable chain mocks
  const populateMock = jest.fn();
  const sortMock = jest.fn();

  beforeEach(() => {
    repo = new AppointmentRepository();
    jest.clearAllMocks();

    // reset chain functions each test
    populateMock.mockImplementation(() => ({ populate: populateMock }));
    sortMock.mockImplementation(() => ({ populate: populateMock }));
  });

  test("create -> calls AppointmentModel.create", async () => {
    (AppointmentModel.create as jest.Mock).mockResolvedValue({ _id: "1" });

    const data: any = { date: "2026-01-01", time: "10:00" };
    const result = await repo.create(data);

    expect(AppointmentModel.create).toHaveBeenCalledWith(data);
    expect(result).toEqual({ _id: "1" });
  });

  test("findById -> calls AppointmentModel.findById", async () => {
    (AppointmentModel.findById as jest.Mock).mockReturnValue("QUERY");

    const result = repo.findById("abc");

    expect(AppointmentModel.findById).toHaveBeenCalledWith("abc");
    expect(result).toBe("QUERY");
  });

  test("findByIdPopulate -> calls findById then populate doctor and patient", async () => {
    (AppointmentModel.findById as jest.Mock).mockReturnValue({
      populate: populateMock,
    });

    const result = repo.findByIdPopulate("id1");

    expect(AppointmentModel.findById).toHaveBeenCalledWith("id1");

    // first populate("doctor")
    expect(populateMock).toHaveBeenCalledWith("doctor");

    // second populate("patient", "-password")
    expect(populateMock).toHaveBeenCalledWith("patient", "-password");

    expect(result).toBeDefined();
  });

  test("findMine -> calls find + sort + populate doctor", async () => {
    (AppointmentModel.find as jest.Mock).mockReturnValue({
      sort: sortMock,
    });

    // sort returns object that has populate
    sortMock.mockReturnValue({ populate: populateMock });

    repo.findMine("p1");

    expect(AppointmentModel.find).toHaveBeenCalledWith({ patient: "p1" });
    expect(sortMock).toHaveBeenCalledWith({ date: -1, time: -1 });
    expect(populateMock).toHaveBeenCalledWith("doctor");
  });

  test("findAll -> calls find(filters) + sort + populate doctor & patient", async () => {
    (AppointmentModel.find as jest.Mock).mockReturnValue({
      sort: sortMock,
    });

    // sort returns object that has populate (chain)
    sortMock.mockReturnValue({ populate: populateMock });
    populateMock.mockImplementation(() => ({ populate: populateMock }));

    const filters = { status: "PENDING" };

    repo.findAll(filters);

    expect(AppointmentModel.find).toHaveBeenCalledWith(filters);
    expect(sortMock).toHaveBeenCalledWith({ date: -1, time: -1 });

    expect(populateMock).toHaveBeenCalledWith("doctor");
    expect(populateMock).toHaveBeenCalledWith("patient", "-password");
  });

  test("findSameSlot -> calls findOne with doctor ObjectId and status != CANCELLED", async () => {
    (AppointmentModel.findOne as jest.Mock).mockResolvedValue({ _id: "a1" });

    const doctorId = "64b64c2f7c2c2c2c2c2c2c2c";
    const date = "2026-01-01";
    const time = "10:00";

    await repo.findSameSlot(doctorId, date, time);

    expect(AppointmentModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        doctor: expect.any(mongoose.Types.ObjectId),
        date,
        time,
        status: { $ne: "CANCELLED" },
      })
    );
  });

  test("updateById -> calls findByIdAndUpdate + populate doctor & patient", async () => {
    (AppointmentModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      populate: populateMock,
    });

    populateMock.mockImplementation(() => ({ populate: populateMock }));

    repo.updateById("id1", { status: "APPROVED" });

    expect(AppointmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "id1",
      { status: "APPROVED" },
      { new: true }
    );

    expect(populateMock).toHaveBeenCalledWith("doctor");
    expect(populateMock).toHaveBeenCalledWith("patient", "-password");
  });
});