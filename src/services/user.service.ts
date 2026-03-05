import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { CLIENT_URL, JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";

const userRepository = new UserRepository();

const sanitizeUser = (user: any) => {
  if (!user) return user;
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  delete u.__v;
  return u;
};

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) throw new HttpError(403, "Email already in use");

    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) throw new HttpError(403, "Username already in use");

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);
    return sanitizeUser(newUser);
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError(404, "User not found");

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) throw new HttpError(401, "Invalid credentials");

    if (!JWT_SECRET) throw new HttpError(500, "JWT_SECRET missing in server config");

    const payload = {
      id: String(user._id),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, user: sanitizeUser(user) };
  }

  async updateUser(userId: string, updateData: Partial<UpdateUserDTO>) {
    if (updateData.password) {
      const hashedPassword = await bcryptjs.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);
    if (!updatedUser) throw new HttpError(404, "User not found");

    return sanitizeUser(updatedUser);
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");
    return sanitizeUser(user);
  }

  // ✅ Send reset link to EMAIL
  async sendResetPasswordEmail(email?: string) {
    if (!email) throw new HttpError(400, "Email is required");

    const user = await userRepository.getUserByEmail(email);
    if (!user) throw new HttpError(404, "User not found");

    if (!JWT_SECRET) throw new HttpError(500, "JWT_SECRET missing in server config");
    if (!CLIENT_URL) throw new HttpError(500, "CLIENT_URL missing in server config");

    // token valid for 1 hour
    const token = jwt.sign({ id: String(user._id) }, JWT_SECRET, { expiresIn: "1h" });

    // ✅ FRONTEND LINK
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;

    // ✅ helpful for debugging (optional)
    console.log("Reset link:", resetLink);

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <p>
          <a href="${resetLink}"
             style="display:inline-block;padding:10px 16px;background:#1EA095;color:#fff;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
        </p>
        <p>If you didn’t request this, ignore this email.</p>
      </div>
    `;

    await sendEmail(user.email, "Password Reset", html);
    return sanitizeUser(user);
  }

  // ✅ Reset password using token from URL param
  async resetPassword(token?: string, newPassword?: string) {
    if (!token || !newPassword) {
      throw new HttpError(400, "Token and new password are required");
    }

    if (String(newPassword).length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }

    if (!JWT_SECRET) throw new HttpError(500, "JWT_SECRET missing in server config");

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err: any) {
      throw new HttpError(400, "Invalid or expired token");
    }

    const userId = decoded?.id;
    if (!userId) throw new HttpError(400, "Invalid token payload");

    const user = await userRepository.getUserById(String(userId));
    if (!user) throw new HttpError(404, "User not found");

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await userRepository.updateUser(String(userId), { password: hashedPassword });

    return sanitizeUser(user);
  }
}