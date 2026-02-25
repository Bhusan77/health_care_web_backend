import { Request, Response } from "express";
import * as DoctorService from "../services/doctor.service";

// ✅ Public/User: Get all doctors
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { q, specialization } = req.query as any;
    const doctors = await DoctorService.getDoctorsService(q, specialization);

    return res.json({ success: true, doctors });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ✅ Public/User: Get doctor by id
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await DoctorService.getDoctorByIdService(req.params.id);
    return res.json({ success: true, doctor });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};