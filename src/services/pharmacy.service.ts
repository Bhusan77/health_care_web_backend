import { HttpError } from "../errors/http-error";
import { PharmacyRepository } from "../repositories/pharmacy.repository";
import { OrderRepository } from "../repositories/order.repository";
import { MedicineModel } from "../models/medicine.model";

const pharmacyRepo = new PharmacyRepository();
const orderRepo = new OrderRepository();


export const listMedicinesService = async () => {
  return pharmacyRepo.findAll();
};

// ✅ User: create order
export const createOrderService = async (userId: string, data: any) => {
  const { items, deliveryAddress } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "items are required");
  }

  let total = 0;
  const finalItems: any[] = [];

  // 1) validate + compute
  for (const it of items) {
    const { medicine, qty } = it;

    if (!medicine || !qty || qty < 1) {
      throw new HttpError(400, "Invalid items format");
    }

    const med = await MedicineModel.findById(medicine);
    if (!med) throw new HttpError(404, "Medicine not found");

    if (med.stock < qty) {
      throw new HttpError(409, `Not enough stock for ${med.name}`);
    }

    finalItems.push({
      medicine: med._id,
      qty,
      priceAtPurchase: med.price,
    });

    total += med.price * qty;
  }

  // 2) reduce stock (simple approach)
  for (const it of finalItems) {
    await MedicineModel.findByIdAndUpdate(it.medicine, {
      $inc: { stock: -it.qty },
    });
  }

  // 3) create order
  return orderRepo.create({
    user: userId,
    items: finalItems,
    total,
    deliveryAddress,
    status: "PENDING",
  });
};

// ✅ User: my orders
export const myOrdersService = async (userId: string) => {
  return orderRepo.findByUser(userId);
};