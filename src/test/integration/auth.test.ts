import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";

import app from "../../app";
import { UserModel } from "../../models/user.model";

dotenv.config();

// ✅ mock email sender used in your service
jest.mock("../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "Password123!",
};

let token = "";

beforeAll(async () => {
  const mongoUri =
    process.env.MONGODB_URI?.replace("/olala_db", "/olala_db_test") ??
    "mongodb://127.0.0.1:27017/olala_db_test";

  await mongoose.connect(mongoUri);

  await UserModel.deleteMany({ email: testUser.email });
  await UserModel.deleteMany({ username: testUser.username });
}, 30000);

afterAll(async () => {
  await UserModel.deleteMany({ email: testUser.email });
  await UserModel.deleteMany({ username: testUser.username });

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);

describe("Auth API", () => {

  // -------------------------
  // REGISTER
  // -------------------------
  describe("POST /api/auth/register", () => {

    test("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "User Created");
      expect(res.body).toHaveProperty("data");

      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).toHaveProperty("username", testUser.username);
      expect(res.body.data).not.toHaveProperty("password");
    });

    test("should fail if email already used", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: "anotheruser",
          email: testUser.email,
          password: "Password123!",
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Email already in use");
    });

    test("should fail if username already used", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: testUser.username,
          email: "another@example.com",
          password: "Password123!",
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Username already in use");
    });

    test("should fail if required fields missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "x" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });

  });

  // -------------------------
  // LOGIN
  // -------------------------
  describe("POST /api/auth/login", () => {

    test("should login successfully", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Login successful");

      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("data");

      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).not.toHaveProperty("password");

      token = res.body.token;
    });

    test("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    test("should fail with unregistered email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "Password123!",
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "User not found");
    });

    test("should fail if fields missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });

  });

  // -------------------------
  // REQUEST PASSWORD RESET
  // -------------------------
  describe("POST /api/auth/request-password-reset", () => {

    test("should fail if email missing", async () => {
      const res = await request(app)
        .post("/api/auth/request-password-reset")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Email is required");
    });

    test("should fail if user not found", async () => {
      const res = await request(app)
        .post("/api/auth/request-password-reset")
        .send({ email: "notexist@example.com" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "User not found");
    });

    test("should send reset email", async () => {
      const res = await request(app)
        .post("/api/auth/request-password-reset")
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Password reset email sent");
    });

  });

  // -------------------------
  // RESET PASSWORD
  // -------------------------
  describe("POST /api/auth/reset-password/:token", () => {

    test("should fail if newPassword missing", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password/sometoken")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "Token and new password are required"
      );
    });

    test("should fail with invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password/invalidtoken123")
        .send({ newPassword: "NewPassword123!" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Invalid or expired token");
    });

  });

});