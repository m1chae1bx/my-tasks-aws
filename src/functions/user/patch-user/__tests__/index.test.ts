import { ajvError } from "@test-utils/base-objects";
import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../index";
import { validateRequest } from "../model";
import { patchUserEvent } from "../test-data/patch-user-event";
import { User } from "@libs/user";
import { genericErrorHandler } from "@libs/generic/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("@libs/user", () => ({
  User: {
    patch: jest.fn(),
  },
}));

jest.mock("@libs/generic/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("patch-user", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.patch as jest.Mock).mockResolvedValueOnce(null);
      result = await handler(patchUserEvent);
    });

    it("should return a 200 status code", () => {
      expect(result.statusCode).toBe(200);
    });

    it("should return a success message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - invalid request", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = ajvError;
      result = await handler(patchUserEvent);
    });

    it("should return a 400 status code", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return errors", () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain(ajvError[0].message);
    });
  });

  describe("sad path - invalid request (no body)", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = ajvError;
      result = await handler({ ...patchUserEvent, body: null });
    });

    it("should return a 400 status code", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return errors", () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain(ajvError[0].message);
    });
  });

  describe("sad path - error while patching user", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.patch as jest.Mock).mockRejectedValueOnce(new Error("error"));
      (genericErrorHandler as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(patchUserEvent);
    });

    it("should return a 500 status code", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain("test error");
    });
  });
});
