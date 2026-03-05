import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route";
import doctorRoutes from "./routes/doctor.route";
import appointmentRoutes from "./routes/appointment.route";
import paymentRoutes from "./routes/payment.route";
import pharmacyRoutes from "./routes/pharmacy.route";

import adminUserRoutes from "./routes/admin/user.route";
import adminDoctorRoutes from "./routes/admin/doctor.route";
import adminAppointmentRoutes from "./routes/admin/appointment.route";
import adminOrderRoutes from "./routes/admin/order.route";
import adminPharmacyRoutes from "./routes/admin/pharmacy.route";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pharmacy", pharmacyRoutes);

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/doctors", adminDoctorRoutes);
app.use("/api/admin/appointments", adminAppointmentRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/pharmacy", adminPharmacyRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

export default app;