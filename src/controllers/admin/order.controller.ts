import { Request, Response } from "express";
import { AdminOrderService } from "../../services/admin/order.service";

const service = new AdminOrderService();

export class AdminOrderController {
  async all(req: Request, res: Response) {
    try {
      const orders = await service.getAll(req.query);
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await service.getById(req.params.id);
      return res.json({ success: true, data: order });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const order = await service.updateStatus(req.params.id, req.body.status);
      return res.json({ success: true, message: "Status updated", data: order });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}