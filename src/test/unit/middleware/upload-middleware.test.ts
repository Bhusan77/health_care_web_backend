import type { Express } from "express";
import { HttpError } from "../../../errors/http-error";
import { fileFilter } from "../../../middleware/upload.middleware";

describe("upload.middleware fileFilter", () => {
  const mockReq: any = {};

  const createFile = (mimetype: string) =>
    ({
      mimetype,
      originalname: "test.png",
    }) as Express.Multer.File;

  test("should allow JPEG file", (done) => {
    const file = createFile("image/jpeg");

    fileFilter(mockReq, file, (err: any, accept?: boolean) => {
      expect(err).toBeNull();
      expect(accept).toBe(true);
      done();
    });
  });

  test("should allow PNG file", (done) => {
    const file = createFile("image/png");

    fileFilter(mockReq, file, (err: any, accept?: boolean) => {
      expect(err).toBeNull();
      expect(accept).toBe(true);
      done();
    });
  });

  test("should reject invalid file type", (done) => {
    const file = createFile("application/pdf");

    fileFilter(mockReq, file, (err: any) => {
      expect(err).toBeInstanceOf(HttpError);
      expect(err.message).toBe(
        "Invalid file type. Only JPEG, PNG and GIF are allowed."
      );
      done();
    });
  });
});