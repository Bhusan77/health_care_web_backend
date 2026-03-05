import { AdminUserController } from "../../../controllers/admin/user.controller";
import { AdminUserService } from "../../../services/admin/user.service";

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
    jest.restoreAllMocks();
  });

  test("createUser -> should create user (201)", async () => {
    const created = { _id: "1" };

    jest
      .spyOn(AdminUserService.prototype, "createUser")
      .mockResolvedValue(created as any);

    const req: any = {
      body: {
        username: "test",
        email: "test@example.com",
        password: "Password123!",
      },
    };

    const res = mockRes();

    await controller.createUser(req, res as any, jest.fn());

    expect(AdminUserService.prototype.createUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Created",
      data: created,
    });
  });

  test("createUser -> should attach profile if file exists", async () => {
    const created = { _id: "1" };

    jest
      .spyOn(AdminUserService.prototype, "createUser")
      .mockResolvedValue(created as any);

    const req: any = {
      body: {
        username: "test",
        email: "test@example.com",
        password: "Password123!",
      },
      file: { filename: "p.png" },
    };

    const res = mockRes();

    await controller.createUser(req, res as any, jest.fn());

    expect(AdminUserService.prototype.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: "/uploads/p.png",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("getAllUsers -> should return users + pagination", async () => {
    const users = [{ _id: "1" }];
    const pagination = { page: 1, size: 10, total: 1, totalPages: 1 };

    jest
      .spyOn(AdminUserService.prototype, "getAllUsers")
      .mockResolvedValue({ users, pagination } as any);

    const req: any = { query: { page: "1", size: "10", search: "" } };
    const res = mockRes();

    await controller.getAllUsers(req, res as any, jest.fn());

    expect(AdminUserService.prototype.getAllUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: users,
      pagination,
      message: "All Users Retrieved",
    });
  });

  test("updateUser -> should update user (200)", async () => {
    const updated = { _id: "1", username: "updated" };

    jest
      .spyOn(AdminUserService.prototype, "updateUser")
      .mockResolvedValue(updated as any);

    const req: any = {
      params: { id: "1" },
      body: { username: "updated" },
    };

    const res = mockRes();

    await controller.updateUser(req, res as any, jest.fn());

    expect(AdminUserService.prototype.updateUser).toHaveBeenCalledWith(
      "1",
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Updated",
      data: updated,
    });
  });

  test("updateUser -> should attach profile if file exists", async () => {
    const updated = { _id: "1" };

    jest
      .spyOn(AdminUserService.prototype, "updateUser")
      .mockResolvedValue(updated as any);

    const req: any = {
      params: { id: "1" },
      body: { username: "updated" },
      file: { filename: "new.png" },
    };

    const res = mockRes();

    await controller.updateUser(req, res as any, jest.fn());

    expect(AdminUserService.prototype.updateUser).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        profile: "/uploads/new.png",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteUser -> should delete user (200)", async () => {
    jest
      .spyOn(AdminUserService.prototype, "deleteUser")
      .mockResolvedValue(true as any);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.deleteUser(req, res as any, jest.fn());

    expect(AdminUserService.prototype.deleteUser).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Deleted",
    });
  });

  test("deleteUser -> should return 404 if user not found", async () => {
    jest
      .spyOn(AdminUserService.prototype, "deleteUser")
      .mockResolvedValue(false as any);

    const req: any = { params: { id: "missing" } };
    const res = mockRes();

    await controller.deleteUser(req, res as any, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  test("getUserById -> should return user (200)", async () => {
    const user = { _id: "1", email: "a@a.com" };

    jest
      .spyOn(AdminUserService.prototype, "getUserById")
      .mockResolvedValue(user as any);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.getUserById(req, res as any, jest.fn());

    expect(AdminUserService.prototype.getUserById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: user,
      message: "Single User Retrieved",
    });
  });
});