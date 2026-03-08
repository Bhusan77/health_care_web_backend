import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://192.168.1.76:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// import dotenv from "dotenv";
// dotenv.config();

// import app from "./app";
// import { connectDatabase } from "./database/mongodb";

// const PORT = Number(process.env.PORT) || 8000;

// async function startServer() {
//   try {
//     await connectDatabase();
//     console.log("MongoDB connected");

//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });

//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// }

// startServer();