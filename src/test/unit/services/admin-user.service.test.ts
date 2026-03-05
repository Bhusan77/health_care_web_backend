import { AdminUserService } from "../../../services/admin/user.service";
import { UserRepository } from "../../../repositories/user.repository";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("AdminUserService (unit)", () => {
  let service: AdminUserService;

  beforeEach(() => {
    service = new AdminUserService();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("createUser -> throws 403 if email already exists", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserByEmail")
      .mockResolvedValue({ _id: "u1" } as any);

    await expect(
      service.createUser({
        email: "test@test.com",
        username: "user1",
        password: "123456",
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: "Email already in use",
      })
    );
  });

  test("createUser -> throws 403 if username already exists", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserByEmail")
      .mockResolvedValue(null as any);

    jest
      .spyOn(UserRepository.prototype, "getUserByUsername")
      .mockResolvedValue({ _id: "u1" } as any);

    await expect(
      service.createUser({
        email: "test@test.com",
        username: "user1",
        password: "123456",
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: "Username already in use",
      })
    );
  });

  test("createUser -> hashes password and creates user", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserByEmail")
      .mockResolvedValue(null as any);

    jest
      .spyOn(UserRepository.prototype, "getUserByUsername")
      .mockResolvedValue(null as any);

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const createSpy = jest
      .spyOn(UserRepository.prototype, "createUser")
      .mockResolvedValue({ _id: "u1" } as any);

    const result = await service.createUser({
      email: "test@test.com",
      username: "user1",
      password: "123456",
    } as any);

    // password should be replaced by hashed password before createUser is called
    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@test.com",
        username: "user1",
        password: "hashedPassword",
      })
    );
    expect(result).toEqual({ _id: "u1" });
  });

  test("getAllUsers -> returns users with pagination", async () => {
    // ✅ FIX: users must match IUser[] type, easiest is `as any`
    jest.spyOn(UserRepository.prototype, "getAllUsers").mockResolvedValue({
      users: [{ _id: "u1", email: "test@test.com", username: "user1" }] as any,
      total: 1,
    });

    const result = await service.getAllUsers("1", "10", "");

    expect(UserRepository.prototype.getAllUsers).toBeDefined();
    expect(result.users.length).toBe(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.size).toBe(10);
    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  test("getAllUsers -> uses default page=1 size=10 if not provided", async () => {
    jest.spyOn(UserRepository.prototype, "getAllUsers").mockResolvedValue({
      users: [] as any,
      total: 0,
    });

    const result = await service.getAllUsers(undefined, undefined, undefined);

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.size).toBe(10);
    expect(result.pagination.totalItems).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  test("deleteUser -> throws 404 if user not found", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserById")
      .mockResolvedValue(null as any);

    await expect(service.deleteUser("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "User not found",
      })
    );
  });

  test("deleteUser -> deletes user", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserById")
      .mockResolvedValue({ _id: "u1" } as any);

    const spy = jest
      .spyOn(UserRepository.prototype, "deleteUser")
      .mockResolvedValue(true);

    const result = await service.deleteUser("u1");

    expect(spy).toHaveBeenCalledWith("u1");
    expect(result).toBe(true);
  });

  test("updateUser -> throws 404 if user not found", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserById")
      .mockResolvedValue(null as any);

    await expect(service.updateUser("x", {} as any)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "User not found",
      })
    );
  });

  test("updateUser -> updates user", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserById")
      .mockResolvedValue({ _id: "u1" } as any);

    const spy = jest
      .spyOn(UserRepository.prototype, "updateUser")
      .mockResolvedValue({ _id: "u1", username: "new" } as any);

    const result = await service.updateUser("u1", { username: "new" } as any);

    expect(spy).toHaveBeenCalledWith("u1", { username: "new" });
    expect(result).toEqual({ _id: "u1", username: "new" });
  });

  test("getUserById -> throws 404 if user not found", async () => {
    jest
      .spyOn(UserRepository.prototype, "getUserById")
      .mockResolvedValue(null as any);

    await expect(service.getUserById("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "User not found",
      })
    );
  });

  test("getUserById -> returns user", async () => {
    const user = { _id: "u1", email: "test@test.com" };

    const spy = jest
      .spyOn(UserRepository.prototype, "getUserById")
      .mockResolvedValue(user as any);

    const result = await service.getUserById("u1");

    expect(spy).toHaveBeenCalledWith("u1");
    expect(result).toEqual(user);
  });
});