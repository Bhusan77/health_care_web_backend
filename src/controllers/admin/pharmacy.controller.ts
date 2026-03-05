import { Request, Response } from "express";
import * as PharmacyService from "../../services/admin/pharmacy.service";

export const createMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = await PharmacyService.createMedicineService(req.body);

    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      medicine,
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const medicines = await PharmacyService.getMedicinesService();
    return res.json({ success: true, medicines });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const medicine = await PharmacyService.getMedicineByIdService(req.params.id);
    return res.json({ success: true, medicine });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = await PharmacyService.updateMedicineService(
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  try {
    await PharmacyService.deleteMedicineService(req.params.id);

    return res.json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};