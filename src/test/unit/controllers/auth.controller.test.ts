import { AuthController } from "../../../controllers/auth.controller";
import { UserService } from "../../../services/user.service";

// optional: silence console logs from controller/service during tests
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
  (console.log as any).mockRestore?.();
});

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AuthController (unit)", () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController();
    jest.restoreAllMocks();
  });

  test("register -> creates user (201)", async () => {
    const createdUser = { _id: "1", email: "test@example.com" };

    jest
      .spyOn(UserService.prototype, "createUser")
      .mockResolvedValue(createdUser as any);

    const req: any = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
      },
    };

    const res = mockRes();

    await controller.register(req, res);

    expect(UserService.prototype.createUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Created",
      data: createdUser,
    });
  });

  test("register -> validation error returns 400", async () => {
    const req: any = { body: {} }; // invalid
    const res = mockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("login -> returns token and user", async () => {
    const user = { _id: "1", email: "test@example.com" };
    const token = "token123";

    jest
      .spyOn(UserService.prototype, "loginUser")
      .mockResolvedValue({ token, user } as any);

    const req: any = {
      body: { email: "test@example.com", password: "Password123!" },
    };

    const res = mockRes();

    await controller.login(req, res);

    expect(UserService.prototype.loginUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: user,
      token,
    });
  });

  test("login -> validation error returns 400", async () => {
    const req: any = { body: {} };
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("updateUser -> updates user", async () => {
    const updated = { _id: "1", username: "updated" };

    jest
      .spyOn(UserService.prototype, "updateUser")
      .mockResolvedValue(updated as any);

    const req: any = {
      user: { _id: "1" },
      body: { username: "updated" },
      file: { filename: "abc.png" },
    };

    const res = mockRes();

    await controller.updateUser(req, res);

    expect(UserService.prototype.updateUser).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ profile: "/uploads/abc.png" })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated",
      data: updated,
    });
  });

  test("updateUser -> returns 400 if userId missing", async () => {
    const req: any = { user: undefined, body: { username: "x" } };
    const res = mockRes();

    await controller.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User ID not found in request",
    });
  });

  test("getUserById -> returns user", async () => {
    const user = { _id: "1", email: "test@example.com" };

    jest
      .spyOn(UserService.prototype, "getUserById")
      .mockResolvedValue(user as any);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.getUserById(req, res);

    expect(UserService.prototype.getUserById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User retrieved",
      data: user,
    });
  });

  test("requestPasswordReset -> sends reset email", async () => {
    const user = { _id: "1", email: "test@example.com" };

    jest
      .spyOn(UserService.prototype, "sendResetPasswordEmail")
      .mockResolvedValue(user as any);

    const req: any = { body: { email: "test@example.com" } };
    const res = mockRes();

    await controller.requestPasswordReset(req, res);

    expect(UserService.prototype.sendResetPasswordEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: user,
      message: "Password reset email sent",
    });
  });

  test("requestPasswordReset -> returns 400 if email missing", async () => {
    const req: any = { body: {} };
    const res = mockRes();

    await controller.requestPasswordReset(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email is required",
    });
  });

  test("resetPassword -> resets password", async () => {
    jest
      .spyOn(UserService.prototype, "resetPassword")
      .mockResolvedValue(true as any);

    const req: any = {
      params: { token: "token123" },
      body: { newPassword: "NewPassword123!" },
    };

    const res = mockRes();

    await controller.resetPassword(req, res);

    expect(UserService.prototype.resetPassword).toHaveBeenCalledWith(
      "token123",
      "NewPassword123!"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password has been reset successfully.",
    });
  });
});