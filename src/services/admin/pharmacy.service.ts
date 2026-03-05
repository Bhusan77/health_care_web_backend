import { HttpError } from "../../errors/http-error";
import { PharmacyRepository } from "../../repositories/pharmacy.repository";

const pharmacyRepo = new PharmacyRepository();

export const createMedicineService = async (data: any) => {
  const { name, price, stock } = data;

  if (!name || price === undefined || stock === undefined) {
    throw new HttpError(400, "name, price and stock are required");
  }

  if (price < 0) throw new HttpError(400, "price must be >= 0");
  if (stock < 0) throw new HttpError(400, "stock must be >= 0");

  return pharmacyRepo.create(data);
};

export const getMedicinesService = async () => {
  return pharmacyRepo.findAll();
};

export const getMedicineByIdService = async (id: string) => {
  const medicine = await pharmacyRepo.findById(id);
  if (!medicine) throw new HttpError(404, "Medicine not found");
  return medicine;
};

export const updateMedicineService = async (id: string, data: any) => {
  const updated = await pharmacyRepo.updateById(id, data);
  if (!updated) throw new HttpError(404, "Medicine not found");
  return updated;
};

export const deleteMedicineService = async (id: string) => {
  const deleted = await pharmacyRepo.deleteById(id);
  if (!deleted) throw new HttpError(404, "Medicine not found");
  return deleted;
};