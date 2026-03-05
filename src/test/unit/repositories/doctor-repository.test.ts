import { DoctorRepository } from "../../../repositories/doctor.repository";
import { DoctorModel } from "../../../models/doctor.model";

jest.mock("../../../models/doctor.model", () => ({
  DoctorModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe("DoctorRepository (unit)", () => {
  let repo: DoctorRepository;

  beforeEach(() => {
    repo = new DoctorRepository();
    jest.clearAllMocks();
  });

  test("create -> should call DoctorModel.create", async () => {
    const doctor = { _id: "1", name: "Dr Test" };

    (DoctorModel.create as jest.Mock).mockResolvedValue(doctor);

    const result = await repo.create({ name: "Dr Test" });

    expect(DoctorModel.create).toHaveBeenCalledWith({ name: "Dr Test" });
    expect(result).toEqual(doctor);
  });

  test("findAll -> should call find and sort by createdAt", async () => {
    const sortMock = jest.fn().mockResolvedValue([{ name: "Dr A" }]);

    (DoctorModel.find as jest.Mock).mockReturnValue({
      sort: sortMock,
    });

    const result = await repo.findAll();

    expect(DoctorModel.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ name: "Dr A" }]);
  });

  test("findById -> should call DoctorModel.findById", async () => {
    const doctor = { _id: "1", name: "Dr A" };

    (DoctorModel.findById as jest.Mock).mockResolvedValue(doctor);

    const result = await repo.findById("1");

    expect(DoctorModel.findById).toHaveBeenCalledWith("1");
    expect(result).toEqual(doctor);
  });

  test("updateById -> should call findByIdAndUpdate", async () => {
    const updatedDoctor = { _id: "1", name: "Dr Updated" };

    (DoctorModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedDoctor);

    const result = await repo.updateById("1", { name: "Dr Updated" });

    expect(DoctorModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { name: "Dr Updated" },
      { new: true }
    );

    expect(result).toEqual(updatedDoctor);
  });

  test("deleteById -> should call findByIdAndDelete", async () => {
    const deletedDoctor = { _id: "1", name: "Dr A" };

    (DoctorModel.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedDoctor);

    const result = await repo.deleteById("1");

    expect(DoctorModel.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(result).toEqual(deletedDoctor);
  });
});