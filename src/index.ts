import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import authRoutes from "./routes/auth.route";
import path from 'path';
import morgan from 'morgan';
import adminRoute from './routes/admin/user.route';
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