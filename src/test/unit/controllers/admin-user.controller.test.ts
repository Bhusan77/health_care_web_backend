import { AdminUserController } from "../../../controllers/admin/user.controller";
import { AdminUserService } from "../../../services/admin/user.service";


jest.mock("../../services/admin/user.service", () => {
  return {
    AdminUserService: jest.fn().mockImplementation(() => ({
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserById: jest.fn(),
    })),
  };
});

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AdminUserController (unit)", () => {
  let controller: AdminUserController;

  beforeEach(() => {
    controller = new AdminUserController();
    jest.clearAllMocks();
  });

  // -------------------------
  // createUser
  // -------------------------
  test("createUser -> should create user (201)", async () => {
    const created = { _id: "1", email: "a@a.com" };

    // ✅ get the mocked instance created by controller file
    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.createUser.mockResolvedValue(created);

    const req: any = {
      body: { username: "a", email: "a@a.com", password: "Password123!" },
      file: undefined,
    };
    const res = mockRes();

    await controller.createUser(req, res as any, jest.fn());

    expect(service.createUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Created",
      data: created,
    });
  });

  test("createUser -> should attach profile if file exists", async () => {
    const created = { _id: "1" };

    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.createUser.mockResolvedValue(created);

    const req: any = {
      body: { username: "a", email: "a@a.com", password: "Password123!" },
      file: { filename: "pic.png" },
    };
    const res = mockRes();

    await controller.createUser(req, res as any, jest.fn());

    // ✅ check that profile path was set before service call
    const calledArg = service.createUser.mock.calls[0][0];
    expect(calledArg.profile).toBe("/uploads/pic.png");

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createUser -> should return 400 for invalid body (zod)", async () => {
    const req: any = { body: {}, file: undefined };
    const res = mockRes();

    await controller.createUser(req, res as any, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // -------------------------
  // getAllUsers
  // -------------------------
  test("getAllUsers -> should return users + pagination", async () => {
    const users = [{ _id: "1" }];
    const pagination = { page: 1, size: 10, total: 1, totalPages: 1 };

    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.getAllUsers.mockResolvedValue({ users, pagination });

    const req: any = { query: { page: "1", size: "10", search: "" } };
    const res = mockRes();

    await controller.getAllUsers(req, res as any, jest.fn());

    expect(service.getAllUsers).toHaveBeenCalledWith("1", "10", "");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: users,
      pagination,
      message: "All Users Retrieved",
    });
  });

  // -------------------------
  // updateUser
  // -------------------------
  test("updateUser -> should update user (200)", async () => {
    const updated = { _id: "1", username: "updated" };

    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.updateUser.mockResolvedValue(updated);

    const req: any = {
      params: { id: "1" },
      body: { username: "updated" },
      file: undefined,
    };
    const res = mockRes();

    await controller.updateUser(req, res as any, jest.fn());

    expect(service.updateUser).toHaveBeenCalledWith("1", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Updated",
      data: updated,
    });
  });

  test("updateUser -> should attach profile if file exists", async () => {
    const updated = { _id: "1" };

    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.updateUser.mockResolvedValue(updated);

    const req: any = {
      params: { id: "1" },
      body: { username: "u" },
      file: { filename: "new.png" },
    };
    const res = mockRes();

    await controller.updateUser(req, res as any, jest.fn());

    const calledUpdateData = service.updateUser.mock.calls[0][1];
    expect(calledUpdateData.profile).toBe("/uploads/new.png");
  });

  test("updateUser -> should return 400 for invalid body (zod)", async () => {
    const req: any = { params: { id: "1" }, body: {}, file: undefined };
    const res = mockRes();

    await controller.updateUser(req, res as any, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // -------------------------
  // deleteUser
  // -------------------------
  test("deleteUser -> should delete user (200)", async () => {
    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.deleteUser.mockResolvedValue(true);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.deleteUser(req, res as any, jest.fn());

    expect(service.deleteUser).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "User Deleted" });
  });

  test("deleteUser -> should return 404 if user not found", async () => {
    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.deleteUser.mockResolvedValue(false);

    const req: any = { params: { id: "missing" } };
    const res = mockRes();

    await controller.deleteUser(req, res as any, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User not found" });
  });

  // -------------------------
  // getUserById
  // -------------------------
  test("getUserById -> should return user (200)", async () => {
    const user = { _id: "1", email: "a@a.com" };

    const service = (AdminUserService as unknown as jest.Mock).mock.results[0].value;
    service.getUserById.mockResolvedValue(user);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.getUserById(req, res as any, jest.fn());

    expect(service.getUserById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: user,
      message: "Single User Retrieved",
    });
  });
});