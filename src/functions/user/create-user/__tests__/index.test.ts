import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../index";
import { validateRequest } from "../model";
import {
  createUserEvent,
  testUser,
  validationErrors,
} from "../test-data/create-user-event";
import { UsernameUnavailableError } from "@libs/generic/errors";
import { User } from "@libs/user";
import { genericErrorHandler } from "@libs/generic/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("@libs/user", () => ({
  ...jest.requireActual("@libs/user"),
  User: jest.fn(),
}));

jest.mock("@libs/generic/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("create-user", () => {
  beforeAll(() => {
    User.getByEmail = jest.fn();
    User.get = jest.fn();
  });

  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.getByEmail as jest.Mock).mockResolvedValueOnce(null);
      (User.get as jest.Mock).mockResolvedValueOnce(null);
      (User as unknown as jest.Mock).mockReturnValueOnce({
        setPassword: jest.fn(),
        save: jest.fn(),
      });
      result = await handler(createUserEvent);
    });

    it("should return a 200 response", () => {
      expect(result.statusCode).toBe(200);
    });

    it("should return the user id", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - invalid request", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = validationErrors;
      result = await handler(createUserEvent);
    });

    it("should return a 400 response", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return the validation errors", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - invalid request (no body)", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = validationErrors;
      result = await handler({ ...createUserEvent, body: null });
    });

    it("should return a 400 response", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return the validation errors", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - email unavailable", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.getByEmail as jest.Mock).mockResolvedValueOnce(testUser);

      result = await handler(createUserEvent);
    });

    it("should return a 409 response", () => {
      expect(result.statusCode).toBe(409);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - username unavailable on get", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.getByEmail as jest.Mock).mockResolvedValueOnce(null);
      (User.get as jest.Mock).mockResolvedValueOnce(testUser);
      result = await handler(createUserEvent);
    });

    it("should return a 409 response", () => {
      expect(result.statusCode).toBe(409);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - username unavailable error on catch", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.getByEmail as jest.Mock).mockResolvedValueOnce(null);
      (User.get as jest.Mock).mockResolvedValueOnce(null);
      (User as unknown as jest.Mock).mockReturnValueOnce({
        setPassword: jest.fn(),
        save: jest.fn().mockImplementationOnce(() => {
          throw new UsernameUnavailableError();
        }),
      });
      result = await handler(createUserEvent);
    });

    it("should return a 409 response", () => {
      expect(result.statusCode).toBe(409);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - generic error", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (User.getByEmail as jest.Mock).mockResolvedValueOnce(null);
      (User.get as jest.Mock).mockResolvedValueOnce(null);
      (User as unknown as jest.Mock).mockReturnValueOnce({
        setPassword: jest.fn(),
        save: jest.fn().mockImplementationOnce(() => {
          throw new Error("generic error");
        }),
      });
      (genericErrorHandler as jest.Mock).mockClear();
      result = await handler(createUserEvent);
    });

    it("should pass error to genericErrorHandler", () => {
      expect((genericErrorHandler as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });
});
