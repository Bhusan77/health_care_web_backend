import { esewaFailure, esewaSuccess, initiateEsewa } from "../../../controllers/payment.controller";
import * as PaymentService from "../../services/payment.service";

// mock payment service
jest.mock("../../services/payment.service", () => ({
  initiateEsewaForOrder: jest.fn(),
  handleEsewaSuccessV2: jest.fn(),
  handleEsewaFailure: jest.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

describe("PaymentController (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // initiateEsewa
  // -------------------------
  test("initiateEsewa -> should initiate payment", async () => {
    const serviceData = { paymentUrl: "https://esewa.com/pay" };

    (PaymentService.initiateEsewaForOrder as jest.Mock).mockResolvedValue(serviceData);

    const req: any = {
      user: { _id: "user1" },
      body: { orderId: "order123" },
    };

    const res = mockRes();

    await initiateEsewa(req, res);

    expect(PaymentService.initiateEsewaForOrder).toHaveBeenCalledWith(
      "user1",
      "order123"
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Payment initiated",
      ...serviceData,
    });
  });

  test("initiateEsewa -> should return 400 if orderId missing", async () => {
    const req: any = {
      user: { _id: "user1" },
      body: {},
    };

    const res = mockRes();

    await initiateEsewa(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "orderId is required",
    });
  });

  test("initiateEsewa -> should handle error", async () => {
    const err: any = new Error("Payment failed");
    err.statusCode = 500;

    (PaymentService.initiateEsewaForOrder as jest.Mock).mockRejectedValue(err);

    const req: any = {
      user: { _id: "user1" },
      body: { orderId: "order123" },
    };

    const res = mockRes();

    await initiateEsewa(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Payment failed",
    });
  });

  // -------------------------
  // esewaSuccess
  // -------------------------
  test("esewaSuccess -> should verify payment and redirect success", async () => {
    (PaymentService.handleEsewaSuccessV2 as jest.Mock).mockResolvedValue(true);

    const req: any = {
      query: {
        transaction_uuid: "txn123",
        total_amount: "100",
      },
    };

    const res = mockRes();

    await esewaSuccess(req, res);

    expect(PaymentService.handleEsewaSuccessV2).toHaveBeenCalledWith({
      txnUuid: "txn123",
      totalAmount: 100,
    });

    expect(res.redirect).toHaveBeenCalled();
  });

  test("esewaSuccess -> should redirect failure if txnUuid missing", async () => {
    const req: any = { query: {} };
    const res = mockRes();

    await esewaSuccess(req, res);

    expect(res.redirect).toHaveBeenCalled();
  });

  // -------------------------
  // esewaFailure
  // -------------------------
  test("esewaFailure -> should call failure handler and redirect", async () => {
    (PaymentService.handleEsewaFailure as jest.Mock).mockResolvedValue(true);

    const req: any = {
      query: { transaction_uuid: "txn123" },
    };

    const res = mockRes();

    await esewaFailure(req, res);

    expect(PaymentService.handleEsewaFailure).toHaveBeenCalledWith("txn123");
    expect(res.redirect).toHaveBeenCalled();
  });

  test("esewaFailure -> should handle error and redirect", async () => {
    (PaymentService.handleEsewaFailure as jest.Mock).mockRejectedValue(
      new Error("failure")
    );

    const req: any = {
      query: { transaction_uuid: "txn123" },
    };

    const res = mockRes();

    await esewaFailure(req, res);

    expect(res.redirect).toHaveBeenCalled();
  });
});