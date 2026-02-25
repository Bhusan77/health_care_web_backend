import { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service";

const service = new AppointmentService();

export class AppointmentController {
  async create(req: Request, res: Response) {
    try {
      const userId = String((req.user as any)._id);
      const appt = await service.createAppointment(userId, req.body);
      return res.status(201).json({ success: true, appointment: appt });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async myAppointments(req: Request, res: Response) {
    try {
      const userId = String((req.user as any)._id);
      const data = await service.getMyAppointments(userId);
      return res.json({ success: true, appointments: data });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = String((req.user as any)._id);
      const appt = await service.getMyAppointmentById(userId, req.params.id);
      return res.json({ success: true, appointment: appt });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const userId = String((req.user as any)._id);
      const appt = await service.cancelMyAppointment(userId, req.params.id, req.body);
      return res.json({ success: true, appointment: appt });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}