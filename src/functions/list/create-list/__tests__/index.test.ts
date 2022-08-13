import { ajvError } from "@test-utils/base-objects";
import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../index";
import { validateRequest } from "../model";
import { createListEvent } from "../test-data/create-list-event";
import { List } from "/opt/nodejs/list.model";
import { genericErrorHandler } from "/opt/nodejs/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("/opt/nodejs/list.model", () => ({
  List: jest.fn(),
}));

jest.mock("/opt/nodejs/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("create-list", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (List as unknown as jest.Mock).mockReturnValueOnce({
        save: jest.fn(),
      });
      result = await handler(createListEvent);
    });

    it("should return a 200 response", () => {
      expect(result.statusCode).toBe(200);
    });

    it("should return the list id", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - invalid request", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = ajvError;
      result = await handler(createListEvent);
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
      validateRequest.errors = ajvError;
      result = await handler({ ...createListEvent, body: null });
    });

    it("should return a 400 response", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return the validation errors", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - error while saving list", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (List as unknown as jest.Mock).mockReturnValueOnce({
        save: jest.fn().mockRejectedValueOnce(new Error("error")),
      });
      (genericErrorHandler as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(createListEvent);
    });

    it("should return a 500 response", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return the error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });
});
