import { Request, Response } from "express";
import { AdminAppointmentService } from "../../services/admin/appointment.service";

const service = new AdminAppointmentService();

export class AdminAppointmentController {
  async all(req: Request, res: Response) {
    try {
      const list = await service.getAllAppointments(req.query);
      return res.json({ success: true, appointments: list });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const appt = await service.getAppointmentById(req.params.id);
      return res.json({ success: true, appointment: appt });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const appt = await service.updateStatus(req.params.id, req.body);
      return res.json({ success: true, appointment: appt });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async reschedule(req: Request, res: Response) {
    try {
      const appt = await service.reschedule(req.params.id, req.body);
      return res.json({ success: true, appointment: appt });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}