import { AdminOrderService } from "../../../services/admin/order.service";
import { OrderRepository } from "../../../repositories/order.repository";

describe("AdminOrderService (unit)", () => {
  let service: AdminOrderService;

  beforeEach(() => {
    service = new AdminOrderService();
    jest.restoreAllMocks();
  });

  test("getAll -> builds filters with status and user", async () => {
    const findAllSpy = jest
      .spyOn(OrderRepository.prototype, "findAll")
      .mockResolvedValue([{ _id: "o1" }] as any);

    const result = await service.getAll({
      status: "PENDING",
      user: "u1",
    });

    expect(findAllSpy).toHaveBeenCalledWith({
      status: "PENDING",
      user: "u1",
    });

    expect(result).toEqual([{ _id: "o1" }]);
  });

  test("getAll -> empty query returns all orders", async () => {
    const findAllSpy = jest
      .spyOn(OrderRepository.prototype, "findAll")
      .mockResolvedValue([{ _id: "o1" }, { _id: "o2" }] as any);

    const result = await service.getAll({});

    expect(findAllSpy).toHaveBeenCalledWith({});
    expect(result.length).toBe(2);
  });

  test("getById -> throws 404 if order not found", async () => {
    jest
      .spyOn(OrderRepository.prototype, "findByIdPopulate")
      .mockResolvedValue(null as any);

    await expect(service.getById("x")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Order not found",
      })
    );
  });

  test("getById -> returns order when found", async () => {
    const order = { _id: "o1", status: "PENDING" };

    const spy = jest
      .spyOn(OrderRepository.prototype, "findByIdPopulate")
      .mockResolvedValue(order as any);

    const result = await service.getById("o1");

    expect(spy).toHaveBeenCalledWith("o1");
    expect(result).toEqual(order);
  });

  test("updateStatus -> throws 400 if status invalid", async () => {
    await expect(service.updateStatus("o1", "INVALID")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid status",
      })
    );
  });

  test("updateStatus -> throws 404 if order not found", async () => {
    jest
      .spyOn(OrderRepository.prototype, "updateStatus")
      .mockResolvedValue(null as any);

    await expect(service.updateStatus("o1", "CONFIRMED")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Order not found",
      })
    );
  });

  test("updateStatus -> success updates order status", async () => {
    const updated = { _id: "o1", status: "CONFIRMED" };

    const spy = jest
      .spyOn(OrderRepository.prototype, "updateStatus")
      .mockResolvedValue(updated as any);

    const result = await service.updateStatus("o1", "CONFIRMED");

    expect(spy).toHaveBeenCalledWith("o1", "CONFIRMED");
    expect(result).toEqual(updated);
  });
});