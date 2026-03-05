import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";

jest.mock("../../../models/user.model", () => ({
  UserModel: Object.assign(jest.fn(), {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }),
}));

describe("UserRepository (unit)", () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
    jest.clearAllMocks();
  });

  test("createUser -> should new UserModel and save", async () => {
  const userData = { email: "a@a.com", username: "a" };

  const saveMock = jest.fn().mockResolvedValue({ _id: "1", ...userData });

  // ✅ make "new UserModel()" return an object that has save()
  (UserModel as unknown as jest.Mock).mockImplementationOnce(() => ({
    save: saveMock,
  }));

  const result = await repo.createUser(userData as any);

  expect(saveMock).toHaveBeenCalledTimes(1);
  expect(result).toEqual({ _id: "1", ...userData });
});

  test("getUserByEmail -> should call UserModel.findOne", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: "1" });

    const result = await repo.getUserByEmail("test@example.com");

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(result).toEqual({ _id: "1" });
  });

  test("getUserByUsername -> should call UserModel.findOne", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: "2" });

    const result = await repo.getUserByUsername("testuser");

    expect(UserModel.findOne).toHaveBeenCalledWith({ username: "testuser" });
    expect(result).toEqual({ _id: "2" });
  });

  test("getUserById -> should call UserModel.findById", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ _id: "3" });

    const result = await repo.getUserById("3");

    expect(UserModel.findById).toHaveBeenCalledWith("3");
    expect(result).toEqual({ _id: "3" });
  });

  test("getAllUsers -> should call find + skip + limit and countDocuments (no search)", async () => {
    const users = [{ _id: "1" }, { _id: "2" }];
    const total = 2;

    const limitMock = jest.fn().mockResolvedValue(users);
    const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

    (UserModel.find as jest.Mock).mockReturnValue({ skip: skipMock });
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(total);

    const result = await repo.getAllUsers(1, 10);

    expect(UserModel.find).toHaveBeenCalledWith({});
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(10);
    expect(UserModel.countDocuments).toHaveBeenCalledWith({});

    expect(result).toEqual({ users, total });
  });

  test("getAllUsers -> should build $or regex filter when search exists", async () => {
    const users = [{ _id: "1" }];
    const total = 1;

    const limitMock = jest.fn().mockResolvedValue(users);
    const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

    (UserModel.find as jest.Mock).mockReturnValue({ skip: skipMock });
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(total);

    const result = await repo.getAllUsers(2, 5, "john");

    // expected filter includes $or with regex
    expect(UserModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.any(Array),
      })
    );

    // page=2 size=5 => skip 5
    expect(skipMock).toHaveBeenCalledWith(5);
    expect(limitMock).toHaveBeenCalledWith(5);

    expect(UserModel.countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.any(Array),
      })
    );

    expect(result).toEqual({ users, total });
  });

  test("updateUser -> should call findByIdAndUpdate", async () => {
    const updated = { _id: "1", username: "updated" };

    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await repo.updateUser("1", { username: "updated" } as any);

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { username: "updated" },
      { new: true }
    );

    expect(result).toEqual(updated);
  });

  test("deleteUser -> should return true if deleted", async () => {
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: "1" });

    const result = await repo.deleteUser("1");

    expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("1");
    expect(result).toBe(true);
  });

  test("deleteUser -> should return false if not found", async () => {
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    const result = await repo.deleteUser("missing");

    expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("missing");
    expect(result).toBe(false);
  });
});