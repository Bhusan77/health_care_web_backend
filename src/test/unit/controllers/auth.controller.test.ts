import { AuthController } from "../../../controllers/auth.controller";
import { UserService } from "../../../services/user.service";

jest.mock("../../services/user.service", () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      createUser: jest.fn(),
      loginUser: jest.fn(),
      updateUser: jest.fn(),
      getUserById: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
      resetPassword: jest.fn(),
    })),
  };
});

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AuthController (unit)", () => {
  let controller: AuthController;
  let service: any;

  beforeEach(() => {
    controller = new AuthController();
    service = (UserService as unknown as jest.Mock).mock.results[0].value;
    jest.clearAllMocks();
  });

  // -------------------------
  // register
  // -------------------------
  test("register -> creates user (201)", async () => {
    const newUser = { _id: "1", email: "a@test.com" };
    service.createUser.mockResolvedValue(newUser);

    const req: any = {
      body: { username: "a", email: "a@test.com", password: "Password123!" },
    };
    const res = mockRes();

    await controller.register(req, res);

    expect(service.createUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Created",
      data: newUser,
    });
  });

  test("register -> validation error returns 400", async () => {
    const req: any = { body: {} };
    const res = mockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // -------------------------
  // login
  // -------------------------
  test("login -> returns token and user", async () => {
    const user = { _id: "1", email: "a@test.com" };

    service.loginUser.mockResolvedValue({
      token: "jwt-token",
      user,
    });

    const req: any = {
      body: { email: "a@test.com", password: "Password123!" },
    };

    const res = mockRes();

    await controller.login(req, res);

    expect(service.loginUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: user,
      token: "jwt-token",
    });
  });

  test("login -> validation error returns 400", async () => {
    const req: any = { body: {} };
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // -------------------------
  // updateUser
  // -------------------------
  test("updateUser -> updates user", async () => {
    const updated = { _id: "1", username: "new" };
    service.updateUser.mockResolvedValue(updated);

    const req: any = {
      user: { _id: "1" },
      body: { username: "new" },
      file: undefined,
    };

    const res = mockRes();

    await controller.updateUser(req, res);

    expect(service.updateUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated",
      data: updated,
    });
  });

  test("updateUser -> returns 400 if userId missing", async () => {
    const req: any = { user: undefined, body: {} };
    const res = mockRes();

    await controller.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // -------------------------
  // getUserById
  // -------------------------
  test("getUserById -> returns user", async () => {
    const user = { _id: "1" };
    service.getUserById.mockResolvedValue(user);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.getUserById(req, res);

    expect(service.getUserById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // -------------------------
  // requestPasswordReset
  // -------------------------
  test("requestPasswordReset -> sends reset email", async () => {
    service.sendResetPasswordEmail.mockResolvedValue(true);

    const req: any = { body: { email: "a@test.com" } };
    const res = mockRes();

    await controller.requestPasswordReset(req, res);

    expect(service.sendResetPasswordEmail).toHaveBeenCalledWith("a@test.com");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("requestPasswordReset -> returns 400 if email missing", async () => {
    const req: any = { body: {} };
    const res = mockRes();

    await controller.requestPasswordReset(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // -------------------------
  // resetPassword
  // -------------------------
  test("resetPassword -> resets password", async () => {
    service.resetPassword.mockResolvedValue(true);

    const req: any = {
      params: { token: "abc123" },
      body: { newPassword: "Password123!" },
    };

    const res = mockRes();

    await controller.resetPassword(req, res);

    expect(service.resetPassword).toHaveBeenCalledWith(
      "abc123",
      "Password123!"
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});