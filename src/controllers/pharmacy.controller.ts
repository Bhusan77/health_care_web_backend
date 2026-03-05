import { Request, Response } from "express";
import * as PharmacyService from "../services/pharmacy.service";

// ✅ Public: list medicines
export const listMedicines = async (req: Request, res: Response) => {
  try {
    const medicines = await PharmacyService.listMedicinesService();
    return res.json({ success: true, medicines });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ✅ User: create order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user?._id);

    const order = await PharmacyService.createOrderService(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ✅ User: my orders
export const myOrders = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user?._id);
    const orders = await PharmacyService.myOrdersService(userId);

    return res.json({ success: true, orders });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};