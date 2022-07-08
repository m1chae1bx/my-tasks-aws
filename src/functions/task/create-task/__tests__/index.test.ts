import { ajvError } from "@test-utils/base-objects";
import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "..";
import { validateRequest } from "../model";
import { createTaskEvent } from "../test-data/create-task-event";
import { Task } from "/opt/nodejs/task.model";
import { genericErrorHandler } from "/opt/nodejs/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("/opt/nodejs/task.model", () => ({
  Task: jest.fn(),
}));

jest.mock("/opt/nodejs/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("create-task", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (Task as unknown as jest.Mock).mockReturnValueOnce({
        save: jest.fn().mockResolvedValueOnce("test-task-id"),
      });
      result = await handler(createTaskEvent);
    });

    it("should return a 200 response", () => {
      expect(result.statusCode).toBe(200);
    });

    it("should return a success message", () => {
      expect(result.body).toMatchSnapshot();
      expect(result.body).toContain("test-task-id");
    });
  });

  describe("sad path - invalid request", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = ajvError;
      result = await handler(createTaskEvent);
    });

    it("should return a 400 response", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return the validation errors", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  describe("sad path - error while saving task", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (Task as unknown as jest.Mock).mockReturnValueOnce({
        save: jest.fn().mockRejectedValueOnce(new Error("test-error")),
      });
      (genericErrorHandler as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(createTaskEvent);
    });

    it("should return a 500 response", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return the error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });
});
