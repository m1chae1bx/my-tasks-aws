import { ajvError } from "@test-utils/base-objects";
import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "..";
import { validateRequest } from "../model";
import { deleteTaskEvent } from "../test-data/delete-task-event";
import { Task } from "/opt/nodejs/task.model";
import { genericErrorHandler } from "/opt/nodejs/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("/opt/nodejs/task.model", () => ({
  Task: {
    delete: jest.fn(),
  },
}));

jest.mock("/opt/nodejs/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("delete-task", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (Task.delete as jest.Mock).mockResolvedValueOnce(null);
      result = await handler(deleteTaskEvent);
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
      result = await handler(deleteTaskEvent);
    });

    it("should return a 400 status code", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return errors", () => {
      expect(result.body).toMatchSnapshot();
      ajvError.forEach((error) => expect(result.body).toContain(error.message));
    });
  });

  describe("sad path - error while deleting task", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (Task.delete as jest.Mock).mockRejectedValueOnce(new Error("error"));
      (genericErrorHandler as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(deleteTaskEvent);
    });

    it("should return a 500 status code", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return an error message", () => {
      expect(result.body).toMatchSnapshot();
    });
  });
});
