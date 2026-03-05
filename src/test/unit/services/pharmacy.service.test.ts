import * as PharmacyService from "../../../services/pharmacy.service";
import { PharmacyRepository } from "../../../repositories/pharmacy.repository";
import { OrderRepository } from "../../../repositories/order.repository";
import { MedicineModel } from "../../../models/medicine.model";

jest.mock("../../../models/medicine.model", () => ({
  MedicineModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe("pharmacy.service (unit)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // ----------------------------------
  // listMedicinesService
  // ----------------------------------
  test("listMedicinesService -> returns medicines", async () => {
    const meds = [{ _id: "m1" }, { _id: "m2" }];

    jest
      .spyOn(PharmacyRepository.prototype, "findAll")
      .mockResolvedValue(meds as any);

    const result = await PharmacyService.listMedicinesService();

    expect(result).toEqual(meds);
  });

  // ----------------------------------
  // myOrdersService
  // ----------------------------------
  test("myOrdersService -> returns user orders", async () => {
    const orders = [{ _id: "o1" }, { _id: "o2" }];

    jest
      .spyOn(OrderRepository.prototype, "findByUser")
      .mockResolvedValue(orders as any);

    const result = await PharmacyService.myOrdersService("u1");

    expect(result).toEqual(orders);
    expect(OrderRepository.prototype.findByUser).toBeDefined();
  });

  // ----------------------------------
  // createOrderService
  // ----------------------------------
  test("createOrderService -> throws 400 if items missing/empty", async () => {
    await expect(
      PharmacyService.createOrderService("u1", { items: [] })
    ).rejects.toEqual(
      expect.objectContaining({ statusCode: 400, message: "items are required" })
    );

    await expect(
      PharmacyService.createOrderService("u1", { })
    ).rejects.toEqual(
      expect.objectContaining({ statusCode: 400, message: "items are required" })
    );
  });

  test("createOrderService -> throws 400 if invalid items format", async () => {
    await expect(
      PharmacyService.createOrderService("u1", {
        items: [{ medicine: "m1", qty: 0 }],
      })
    ).rejects.toEqual(
      expect.objectContaining({ statusCode: 400, message: "Invalid items format" })
    );
  });

  test("createOrderService -> throws 404 if medicine not found", async () => {
    (MedicineModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      PharmacyService.createOrderService("u1", {
        items: [{ medicine: "m1", qty: 2 }],
      })
    ).rejects.toEqual(
      expect.objectContaining({ statusCode: 404, message: "Medicine not found" })
    );
  });

  test("createOrderService -> throws 409 if not enough stock", async () => {
    (MedicineModel.findById as jest.Mock).mockResolvedValue({
      _id: "m1",
      name: "Paracetamol",
      price: 10,
      stock: 1,
    });

    await expect(
      PharmacyService.createOrderService("u1", {
        items: [{ medicine: "m1", qty: 3 }],
      })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: "Not enough stock for Paracetamol",
      })
    );
  });

  test("createOrderService -> success creates order, calculates total, reduces stock", async () => {
    // 2 medicines
    const med1 = { _id: "m1", name: "Paracetamol", price: 10, stock: 10 };
    const med2 = { _id: "m2", name: "Cetrizine", price: 20, stock: 10 };

    // findById called for each item
    (MedicineModel.findById as jest.Mock)
      .mockResolvedValueOnce(med1)
      .mockResolvedValueOnce(med2);

    (MedicineModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

    const createdOrder = { _id: "o1", status: "PENDING" };

    const createSpy = jest
      .spyOn(OrderRepository.prototype, "create")
      .mockResolvedValue(createdOrder as any);

    const result = await PharmacyService.createOrderService("u1", {
      deliveryAddress: "Kathmandu",
      items: [
        { medicine: "m1", qty: 2 }, // 10 * 2 = 20
        { medicine: "m2", qty: 1 }, // 20 * 1 = 20
      ],
    });

    // total should be 40
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "u1",
        total: 40,
        deliveryAddress: "Kathmandu",
        status: "PENDING",
        items: [
          { medicine: "m1", qty: 2, priceAtPurchase: 10 },
          { medicine: "m2", qty: 1, priceAtPurchase: 20 },
        ],
      })
    );

    // reduce stock called for each item
    expect(MedicineModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    expect(MedicineModel.findByIdAndUpdate).toHaveBeenCalledWith("m1", {
      $inc: { stock: -2 },
    });
    expect(MedicineModel.findByIdAndUpdate).toHaveBeenCalledWith("m2", {
      $inc: { stock: -1 },
    });

    expect(result).toEqual(createdOrder);
  });
});