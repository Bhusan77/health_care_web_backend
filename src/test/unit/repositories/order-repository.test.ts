import { OrderRepository } from "../../../repositories/order.repository";
import { OrderModel } from "../../../models/order.model";

jest.mock("../../../models/order.model", () => ({
  OrderModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe("OrderRepository (unit)", () => {
  let repo: OrderRepository;

  const populateMock = jest.fn();
  const sortMock = jest.fn();

  beforeEach(() => {
    repo = new OrderRepository();
    jest.clearAllMocks();

    // allow chaining populate().populate()
    populateMock.mockImplementation(() => ({ populate: populateMock }));
  });

  test("create -> should call OrderModel.create", async () => {
    (OrderModel.create as jest.Mock).mockResolvedValue({ _id: "o1" });

    const data = { user: "u1", items: [] };
    const result = await repo.create(data);

    expect(OrderModel.create).toHaveBeenCalledWith(data);
    expect(result).toEqual({ _id: "o1" });
  });

  test("findAll -> should find(filters) + sort + populate user + populate items.medicine", () => {
    (OrderModel.find as jest.Mock).mockReturnValue({
      sort: sortMock,
    });

    // sort returns object supporting populate chain
    sortMock.mockReturnValue({ populate: populateMock });

    const filters = { status: "PENDING" };
    repo.findAll(filters);

    expect(OrderModel.find).toHaveBeenCalledWith(filters);
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });

    expect(populateMock).toHaveBeenCalledWith("user", "-password");
    expect(populateMock).toHaveBeenCalledWith("items.medicine");
  });

  test("findAll -> should work with default empty filters", () => {
    (OrderModel.find as jest.Mock).mockReturnValue({
      sort: sortMock,
    });

    sortMock.mockReturnValue({ populate: populateMock });

    repo.findAll();

    expect(OrderModel.find).toHaveBeenCalledWith({});
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
  });

  test("findByUser -> should find by user + sort + populate items.medicine", () => {
    (OrderModel.find as jest.Mock).mockReturnValue({
      sort: sortMock,
    });

    sortMock.mockReturnValue({ populate: populateMock });

    repo.findByUser("u1");

    expect(OrderModel.find).toHaveBeenCalledWith({ user: "u1" });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(populateMock).toHaveBeenCalledWith("items.medicine");
  });

  test("findByIdPopulate -> should findById + populate user + populate items.medicine", () => {
    (OrderModel.findById as jest.Mock).mockReturnValue({
      populate: populateMock,
    });

    repo.findByIdPopulate("o1");

    expect(OrderModel.findById).toHaveBeenCalledWith("o1");
    expect(populateMock).toHaveBeenCalledWith("user", "-password");
    expect(populateMock).toHaveBeenCalledWith("items.medicine");
  });

  test("updateStatus -> should update + populate user + populate items.medicine", () => {
    (OrderModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      populate: populateMock,
    });

    repo.updateStatus("o1", "PAID");

    expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "o1",
      { status: "PAID" },
      { new: true }
    );

    expect(populateMock).toHaveBeenCalledWith("user", "-password");
    expect(populateMock).toHaveBeenCalledWith("items.medicine");
  });
});