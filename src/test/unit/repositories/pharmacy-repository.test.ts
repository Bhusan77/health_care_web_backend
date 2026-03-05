import { PharmacyRepository } from "../../../repositories/pharmacy.repository";
import { MedicineModel } from "../../../models/medicine.model";

jest.mock("../../../models/medicine.model", () => ({
  MedicineModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe("PharmacyRepository (unit)", () => {
  let repo: PharmacyRepository;

  beforeEach(() => {
    repo = new PharmacyRepository();
    jest.clearAllMocks();
  });

  test("create -> should call MedicineModel.create", async () => {
    const medicine = { _id: "1", name: "Paracetamol" };

    (MedicineModel.create as jest.Mock).mockResolvedValue(medicine);

    const result = await repo.create({ name: "Paracetamol" });

    expect(MedicineModel.create).toHaveBeenCalledWith({ name: "Paracetamol" });
    expect(result).toEqual(medicine);
  });

  test("findAll -> should call find and sort by createdAt", async () => {
    const sortMock = jest.fn().mockResolvedValue([{ name: "Paracetamol" }]);

    (MedicineModel.find as jest.Mock).mockReturnValue({
      sort: sortMock,
    });

    const result = await repo.findAll();

    expect(MedicineModel.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ name: "Paracetamol" }]);
  });

  test("findById -> should call MedicineModel.findById", async () => {
    const medicine = { _id: "1", name: "Paracetamol" };

    (MedicineModel.findById as jest.Mock).mockResolvedValue(medicine);

    const result = await repo.findById("1");

    expect(MedicineModel.findById).toHaveBeenCalledWith("1");
    expect(result).toEqual(medicine);
  });

  test("updateById -> should call findByIdAndUpdate", async () => {
    const updated = { _id: "1", name: "Updated Medicine" };

    (MedicineModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await repo.updateById("1", { name: "Updated Medicine" });

    expect(MedicineModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { name: "Updated Medicine" },
      { new: true }
    );

    expect(result).toEqual(updated);
  });

  test("deleteById -> should call findByIdAndDelete", async () => {
    const deleted = { _id: "1", name: "Paracetamol" };

    (MedicineModel.findByIdAndDelete as jest.Mock).mockResolvedValue(deleted);

    const result = await repo.deleteById("1");

    expect(MedicineModel.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(result).toEqual(deleted);
  });
});