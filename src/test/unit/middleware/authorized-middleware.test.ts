import jwt from "jsonwebtoken";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../../middleware/authorized.middleware";
import { UserRepository } from "../../../repositories/user.repository";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const mockReq = (overrides: Partial<any> = {}) =>
  ({
    headers: {},
    user: undefined,
    ...overrides,
  }) as any;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authorized.middleware (unit)", () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("401 if user not found in DB", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "u1" });

    // ✅ works even if instance was created at import time
    jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue(null as any);

    const req = mockReq({ headers: { authorization: "Bearer token123" } });
    const res = mockRes();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized User Not Found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("success attaches user and calls next()", async () => {
    const user = { _id: "u1", role: "user" };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "u1" });

    // ✅ mock repo method directly
    jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue(user as any);

    const req = mockReq({ headers: { authorization: "Bearer token123" } });
    const res = mockRes();

    await authorizedMiddleware(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("adminOnlyMiddleware -> 403 if not admin", async () => {
    const req = mockReq({ user: { _id: "u1", role: "user" } });
    const res = mockRes();
    const next2 = jest.fn();

    await adminOnlyMiddleware(req, res, next2);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden Admins Only",
    });
    expect(next2).not.toHaveBeenCalled();
  });

  test("adminOnlyMiddleware -> calls next if admin", async () => {
    const req = mockReq({ user: { _id: "a1", role: "admin" } });
    const res = mockRes();
    const next2 = jest.fn();

    await adminOnlyMiddleware(req, res, next2);

    expect(next2).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});