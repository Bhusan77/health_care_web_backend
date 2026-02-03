import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.put("/update", authorizedMiddleware, uploads.single("profile"), authController.updateUser)
router.get("/users/:id", authController.getUserById)
// add remaning routes like login, logout, etc.

export default router;