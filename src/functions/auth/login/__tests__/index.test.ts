import { handler } from "../index";
import { loginEvent } from "../test-data/login-event";
import { validateRequest } from "../model";
import { User } from "@libs/user";
import { APIGatewayProxyResult } from "aws-lambda";
import { ajvError } from "@test-utils/base-objects";
import { genericErrorHandler } from "@libs/generic/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("@libs/user", () => ({
  User: { get: jest.fn() },
}));

jest.mock("@libs/generic/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("login", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockResolvedValueOnce({
        validatePassword: jest.fn().mockReturnValueOnce(true),
        generateJwt: jest.fn().mockReturnValueOnce("test-token"),
      });
      result = await handler(loginEvent);
    });

    it("should return 200 status code", () => {
      expect(result.statusCode).toBe(200);
    });

    it("should return token", async () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain("test-token");
    });
  });

  describe("sad path - invalid request", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = ajvError;
      result = await handler(loginEvent);
    });

    it("should return 400 status code", () => {
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
      result = await handler({ ...loginEvent, body: null });
    });

    it("should return 400 status code", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return errors", () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain(ajvError[0].message);
    });
  });

  describe("sad path - incorrect password", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockResolvedValueOnce({
        validatePassword: jest.fn().mockReturnValueOnce(false),
      });
      result = await handler(loginEvent);
    });

    it("should return 401 status code", () => {
      expect(result.statusCode).toBe(401);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - user not found", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockResolvedValueOnce(null);
      result = await handler(loginEvent);
    });

    it("should return 401 status code", () => {
      expect(result.statusCode).toBe(401);
    });
  });

  describe("sad path - generic error", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockRejectedValueOnce(new Error("test error"));
      (genericErrorHandler as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(loginEvent);
    });

    it("should return 500 status code", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });
});
