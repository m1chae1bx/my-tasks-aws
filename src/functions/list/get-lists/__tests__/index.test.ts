import { ajvError } from "@test-utils/base-objects";
import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "..";
import { validateRequest } from "../model";
import { getListEvent } from "../test-data/get-list-event";
import { testLists } from "../test-data/test-lists";
import { List } from "/opt/nodejs/list.model";
import { genericErrorHandler } from "/opt/nodejs/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("/opt/nodejs/list.model", () => ({
  List: {
    getAll: jest.fn(),
  },
}));

jest.mock("/opt/nodejs/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("get-list", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (List.getAll as jest.Mock).mockResolvedValueOnce([testLists]);
      result = await handler(getListEvent);
    });

    it("should return a 200 response", () => {
      expect(result.statusCode).toBe(200);
    });

    it("should return the list", () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain(testLists[0].id);
      expect(result.body).toContain(testLists[1].id);
    });
  });

  describe("sad path - invalid request", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = ajvError;
      result = await handler(getListEvent);
    });

    it("should return a 400 response", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return the error", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - error getting the lists", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (List.getAll as jest.Mock).mockRejectedValueOnce(new Error("error"));
      (genericErrorHandler as unknown as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(getListEvent);
    });

    it("should return a 500 response", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return the error", () => {
      expect(result.body).toMatchSnapshot();
    });
  });
});
