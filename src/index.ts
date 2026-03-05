import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();