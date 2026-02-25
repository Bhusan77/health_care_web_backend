import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import authRoutes from "./routes/auth.route";
import path from 'path';
import morgan from 'morgan';
import adminRoute from './routes/admin/user.route';
import adminDoctorRoutes from "./routes/admin/doctor.route";
import doctorRoutes from "./routes/doctor.route";
import appointmentRoutes from "./routes/appointment.route";
import adminAppointmentRoutes from "./routes/admin/appointment.route";
import adminPharmacyRoutes from "./routes/admin/pharmacy.route";
import pharmacyRoutes from "./routes/pharmacy.route";
import adminOrderRoutes from "./routes/admin/order.route";
import cors from 'cors';

const app: Application = express();
const corsOptions = {
    origin:["http://localhost:3000", "http://localhost:3001"]
}
app.use(cors(corsOptions)); // implement cors middleware
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminRoute);
app.use("/api/admin/doctors", adminDoctorRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin/appointments", adminAppointmentRoutes);
app.use("/api/admin/pharmacy", adminPharmacyRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
});

async function startServer() {
    await connectDatabase();

    app.listen(
        PORT,
        () => {
            console.log(`Server: http://localhost:${PORT}`);
        }
    );
}

startServer();