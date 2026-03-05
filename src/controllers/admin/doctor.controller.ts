import { Request, Response } from "express";
import * as DoctorService from "../../services/admin/doctor.service";

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await DoctorService.createDoctorService(req.body);
    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor, // ✅ consistent key
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await DoctorService.getDoctorsService();
    return res.json({
      success: true,
      data: doctors, // ✅ consistent key
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await DoctorService.getDoctorByIdService(req.params.id);
    return res.json({
      success: true,
      data: doctor, // ✅ consistent key
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await DoctorService.updateDoctorService(req.params.id, req.body);
    return res.json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor, // ✅ consistent key
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    await DoctorService.deleteDoctorService(req.params.id);
    return res.json({
      success: true,
      message: "Doctor deleted successfully",
      data: null, // ✅ consistent key (optional)
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};