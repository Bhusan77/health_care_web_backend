import { HttpError } from "../../errors/http-error";
import { OrderRepository } from "../../repositories/order.repository";

const repo = new OrderRepository();

const allowedStatus = ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export class AdminOrderService {
  getAll(query: any) {
    const filters: any = {};
    if (query.status) filters.status = query.status;
    if (query.user) filters.user = query.user; // user id filter
    return repo.findAll(filters);
  }

  async getById(id: string) {
    const order = await repo.findByIdPopulate(id);
    if (!order) throw new HttpError(404, "Order not found");
    return order;
  }

  async updateStatus(id: string, status: string) {
    if (!allowedStatus.includes(status)) throw new HttpError(400, "Invalid status");
    const updated = await repo.updateStatus(id, status);
    if (!updated) throw new HttpError(404, "Order not found");
    return updated;
  }
}