import { OrderModel } from "../models/order.model";

export class OrderRepository {

  // Create new order
  create(data: any) {
    return OrderModel.create(data);
  }

  // Get all orders (for admin)
  findAll(filters: any = {}) {
    return OrderModel.find(filters)
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("items.medicine");
  }

  // Get orders of a specific user
  findByUser(userId: string) {
    return OrderModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.medicine");
  }

  // Get single order with full details
  findByIdPopulate(id: string) {
    return OrderModel.findById(id)
      .populate("user", "-password")
      .populate("items.medicine");
  }

  // Update order status
  updateStatus(id: string, status: string) {
    return OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("user", "-password")
      .populate("items.medicine");
  }

}