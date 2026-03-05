import { HttpError } from "../../../errors/http-error";
import * as PaymentService from "../../../services/payment.service";

// mock models
import { OrderModel } from "../../../models/order.model";
import { PaymentModel } from "../../../models/payment.model";

// mock esewa service functions
import { buildEsewaForm, verifyEsewaPayment } from "../../../services/esewa.service";

jest.mock("../../../models/order.model", () => ({
  OrderModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("../../../models/payment.model", () => ({
  PaymentModel: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("../../../services/esewa.service", () => ({
  buildEsewaForm: jest.fn(),
  verifyEsewaPayment: jest.fn(),
}));

describe("payment.service (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // -------------------------------------------------
  // initiateEsewaForOrder
  // -------------------------------------------------
  test("initiateEsewaForOrder -> 404 if order not found", async () => {
    (OrderModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(PaymentService.initiateEsewaForOrder("u1", "o1")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Order not found",
      })
    );
  });

  test("initiateEsewaForOrder -> 403 if order belongs to another user", async () => {
    (OrderModel.findById as jest.Mock).mockResolvedValue({
      _id: "o1",
      user: "otherUser",
      status: "PENDING",
      total: 100,
    });

    await expect(PaymentService.initiateEsewaForOrder("u1", "o1")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: "Not your order",
      })
    );
  });

  test("initiateEsewaForOrder -> 409 if order status not PENDING", async () => {
    (OrderModel.findById as jest.Mock).mockResolvedValue({
      _id: "o1",
      user: "u1",
      status: "CONFIRMED",
      total: 100,
    });

    await expect(PaymentService.initiateEsewaForOrder("u1", "o1")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: "Order cannot be paid in current state",
      })
    );
  });

  test("initiateEsewaForOrder -> creates payment and returns form data", async () => {
    (OrderModel.findById as jest.Mock).mockResolvedValue({
      _id: "o1",
      user: "u1",
      status: "PENDING",
      total: 250,
    });

    (PaymentModel.create as jest.Mock).mockResolvedValue({
      _id: "p1",
      status: "PENDING",
    });

    (buildEsewaForm as jest.Mock).mockReturnValue({
      paymentUrl: "https://esewa-form-url",
      formData: { transaction_uuid: "txn-123" },
    });

    const result = await PaymentService.initiateEsewaForOrder("u1", "o1");

    expect(PaymentModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "u1",
        order: "o1",
        amount: 250,
        status: "PENDING",
      })
    );

    expect(buildEsewaForm).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 250,
        txnUuid: expect.stringMatching(/^ORD-/),
      })
    );

    expect(result).toEqual(
      expect.objectContaining({
        paymentId: "p1",
        paymentUrl: "https://esewa-form-url",
        formData: { transaction_uuid: "txn-123" },
        transactionRef: expect.stringMatching(/^ORD-/),
      })
    );
  });

  // -------------------------------------------------
  // handleEsewaSuccessV2
  // -------------------------------------------------
  test("handleEsewaSuccessV2 -> 404 if payment record not found", async () => {
    (PaymentModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      PaymentService.handleEsewaSuccessV2({ txnUuid: "txn-1", totalAmount: 100 })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Payment record not found",
      })
    );
  });

  test("handleEsewaSuccessV2 -> returns already true if payment already SUCCESS", async () => {
    const payment = {
      _id: "p1",
      status: "SUCCESS",
    };

    (PaymentModel.findOne as jest.Mock).mockResolvedValue(payment);

    const result = await PaymentService.handleEsewaSuccessV2({
      txnUuid: "txn-1",
      totalAmount: 100,
    });

    expect(result).toEqual({ already: true, payment });
    expect(verifyEsewaPayment).not.toHaveBeenCalled();
  });

  test("handleEsewaSuccessV2 -> marks FAILED if verification fails", async () => {
    const payment = {
      _id: "p1",
      status: "PENDING",
      amount: 100,
      order: "o1",
      save: jest.fn().mockResolvedValue(true),
    };

    (PaymentModel.findOne as jest.Mock).mockResolvedValue(payment);

    (verifyEsewaPayment as jest.Mock).mockResolvedValue({
      ok: false,
      raw: { status: "PENDING" },
    });

    await expect(
      PaymentService.handleEsewaSuccessV2({ txnUuid: "txn-1", totalAmount: 100 })
    ).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: "Payment verification failed",
      })
    );

    expect(payment.status).toBe("FAILED");
    expect(payment.save).toHaveBeenCalled();
  });

  test("handleEsewaSuccessV2 -> sets SUCCESS + updates order to CONFIRMED", async () => {
    const payment = {
      _id: "p1",
      status: "PENDING",
      amount: 100,
      order: "o1",
      save: jest.fn().mockResolvedValue(true),
      esewaRefId: undefined,
    };

    (PaymentModel.findOne as jest.Mock).mockResolvedValue(payment);

    (verifyEsewaPayment as jest.Mock).mockResolvedValue({
      ok: true,
      raw: { status: "COMPLETE", ref_id: "REF123" },
    });

    (OrderModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

    const result = await PaymentService.handleEsewaSuccessV2({
      txnUuid: "txn-1",
      totalAmount: 100,
    });

    expect(payment.status).toBe("SUCCESS");
    expect(payment.esewaRefId).toBe("REF123");
    expect(payment.save).toHaveBeenCalled();

    expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith("o1", {
      status: "CONFIRMED",
    });

    expect(result).toEqual({ already: false, payment });
  });

  test("handleEsewaSuccessV2 -> extracts esewaRefId from transaction_code if present", async () => {
    const payment = {
      _id: "p1",
      status: "PENDING",
      amount: 100,
      order: "o1",
      save: jest.fn().mockResolvedValue(true),
      esewaRefId: undefined,
    };

    (PaymentModel.findOne as jest.Mock).mockResolvedValue(payment);

    (verifyEsewaPayment as jest.Mock).mockResolvedValue({
      ok: true,
      raw: { transaction_code: "TXN-CODE-999" },
    });

    (OrderModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

    await PaymentService.handleEsewaSuccessV2({
      txnUuid: "txn-1",
      totalAmount: 100,
    });

    expect(payment.esewaRefId).toBe("TXN-CODE-999");
  });

  // -------------------------------------------------
  // handleEsewaFailure
  // -------------------------------------------------
  test("handleEsewaFailure -> returns updated:false if txnUuid missing", async () => {
    const result = await PaymentService.handleEsewaFailure(undefined);
    expect(result).toEqual({ updated: false });
  });

  test("handleEsewaFailure -> returns updated:false if payment not found", async () => {
    (PaymentModel.findOne as jest.Mock).mockResolvedValue(null);
    const result = await PaymentService.handleEsewaFailure("txn-1");
    expect(result).toEqual({ updated: false });
  });

  test("handleEsewaFailure -> marks payment FAILED and updated:true", async () => {
    const payment = {
      _id: "p1",
      status: "PENDING",
      save: jest.fn().mockResolvedValue(true),
    };

    (PaymentModel.findOne as jest.Mock).mockResolvedValue(payment);

    const result = await PaymentService.handleEsewaFailure("txn-1");

    expect(payment.status).toBe("FAILED");
    expect(payment.save).toHaveBeenCalled();
    expect(result).toEqual({ updated: true });
  });
});