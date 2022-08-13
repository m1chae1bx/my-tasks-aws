import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../index";
import { validateRequest } from "../model";
import { deleteUserEvent } from "../test-data/delete-user-event";
import { User } from "/opt/nodejs/user.model";
import { ajvError } from "@test-utils/base-objects";
import { genericErrorHandler } from "/opt/nodejs/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("/opt/nodejs/user.model", () => ({
  User: {
    get: jest.fn(),
  },
}));

jest.mock("/opt/nodejs/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("delete-user", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockResolvedValueOnce({
        validatePassword: jest.fn().mockReturnValueOnce(true),
        delete: jest.fn(),
      });
      result = await handler(deleteUserEvent);
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
      result = await handler(deleteUserEvent);
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
      result = await handler({ ...deleteUserEvent, body: null });
    });

    it("should return a 400 status code", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return errors", () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain(ajvError[0].message);
    });
  });

  describe("sad path - user not found", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockResolvedValueOnce(null);
      result = await handler(deleteUserEvent);
    });

    it("should return a 404 status code", () => {
      expect(result.statusCode).toBe(404);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - incorrect password", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockResolvedValueOnce({
        validatePassword: jest.fn().mockReturnValueOnce(false),
      });
      result = await handler(deleteUserEvent);
    });

    it("should return a 401 status code", () => {
      expect(result.statusCode).toBe(401);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - error while deleting user", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.get as jest.Mock).mockResolvedValueOnce({
        validatePassword: jest.fn().mockReturnValueOnce(true),
        delete: jest.fn().mockRejectedValueOnce(new Error("error")),
      });
      (genericErrorHandler as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(deleteUserEvent);
    });

    it("should return a 500 status code", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });
});
