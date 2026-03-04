import { AdminOrderController } from "../../../controllers/admin/order.controller";
import { AdminOrderService } from "../../../services/admin/order.service";
const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AdminOrderController (unit)", () => {
  let controller: AdminOrderController;

  beforeEach(() => {
    controller = new AdminOrderController();
    jest.restoreAllMocks();
  });

  // -------------------------
  // all()
  // -------------------------
  test("all -> should return orders list", async () => {
    const orders = [{ _id: "1" }, { _id: "2" }];

    const spy = jest
      .spyOn(AdminOrderService.prototype, "getAll")
      .mockResolvedValue(orders as any);

    const req: any = { query: { page: "1" } };
    const res = mockRes();

    await controller.all(req, res as any);

    expect(spy).toHaveBeenCalledWith(req.query);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: orders });
    expect(res.status).not.toHaveBeenCalled();
  });

  test("all -> should handle error with statusCode", async () => {
    const err: any = new Error("Boom");
    err.statusCode = 400;

    jest
      .spyOn(AdminOrderService.prototype, "getAll")
      .mockRejectedValue(err);

    const req: any = { query: {} };
    const res = mockRes();

    await controller.all(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Boom" });
  });

  test("all -> should handle error without statusCode (500)", async () => {
    jest
      .spyOn(AdminOrderService.prototype, "getAll")
      .mockRejectedValue(new Error("Internal"));

    const req: any = { query: {} };
    const res = mockRes();

    await controller.all(req, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal",
    });
  });

  // -------------------------
  // getById()
  // -------------------------
  test("getById -> should return order", async () => {
    const order = { _id: "abc", status: "PENDING" };

    const spy = jest
      .spyOn(AdminOrderService.prototype, "getById")
      .mockResolvedValue(order as any);

    const req: any = { params: { id: "abc" } };
    const res = mockRes();

    await controller.getById(req, res as any);

    expect(spy).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({ success: true, data: order });
  });

  test("getById -> should handle error", async () => {
    const err: any = new Error("Order not found");
    err.statusCode = 404;

    jest
      .spyOn(AdminOrderService.prototype, "getById")
      .mockRejectedValue(err);

    const req: any = { params: { id: "missing" } };
    const res = mockRes();

    await controller.getById(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Order not found",
    });
  });

  // -------------------------
  // updateStatus()
  // -------------------------
  test("updateStatus -> should update status", async () => {
    const updated = { _id: "1", status: "DELIVERED" };

    const spy = jest
      .spyOn(AdminOrderService.prototype, "updateStatus")
      .mockResolvedValue(updated as any);

    const req: any = { params: { id: "1" }, body: { status: "DELIVERED" } };
    const res = mockRes();

    await controller.updateStatus(req, res as any);

    expect(spy).toHaveBeenCalledWith("1", "DELIVERED");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Status updated",
      data: updated,
    });
  });

  test("updateStatus -> should handle error (statusCode)", async () => {
    const err: any = new Error("Invalid status");
    err.statusCode = 400;

    jest
      .spyOn(AdminOrderService.prototype, "updateStatus")
      .mockRejectedValue(err);

    const req: any = { params: { id: "1" }, body: { status: "WRONG" } };
    const res = mockRes();

    await controller.updateStatus(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid status",
    });
  });
});