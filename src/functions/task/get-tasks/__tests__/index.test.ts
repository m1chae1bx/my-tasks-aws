import { ajvError } from "@test-utils/base-objects";
import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "..";
import { validateRequest } from "../model";
import { getTasksEvent } from "../test-data/get-task-event";
import { testTasks } from "../test-data/test-tasks";
import { Task } from "@libs/task";
import { genericErrorHandler } from "@libs/generic/util";

jest.mock("../model", () => ({
  validateRequest: jest.fn(),
}));

jest.mock("@libs/task", () => ({
  Task: {
    getAll: jest.fn(),
  },
}));

jest.mock("@libs/generic/util", () => ({
  genericErrorHandler: jest.fn(),
}));

describe("get-tasks", () => {
  describe("happy path", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (Task.getAll as jest.Mock).mockResolvedValueOnce(testTasks);
      result = await handler(getTasksEvent);
    });

    it("should return a 200 response", () => {
      expect(result.statusCode).toBe(200);
    });

    it("should return the tasks", () => {
      expect(result.body).toMatchSnapshot();
      testTasks.forEach((task) => expect(result.body).toContain(task.id));
    });
  });

  describe("sad path - invalid request", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(false);
      validateRequest.errors = ajvError;
      result = await handler(getTasksEvent);
    });

    it("should return a 400 response", () => {
      expect(result.statusCode).toBe(400);
    });

    it("should return the error", () => {
      expect(result.body).toMatchSnapshot();
    });
  });

  // sad path - error while getting tasks
  describe("sad path - error while getting tasks", () => {
    let result: APIGatewayProxyResult;

    beforeAll(async () => {
      (validateRequest as unknown as jest.Mock).mockReturnValueOnce(true);
      (Task.getAll as jest.Mock).mockRejectedValueOnce(new Error("test error"));
      (genericErrorHandler as unknown as jest.Mock).mockReturnValueOnce({
        statusCode: 500,
        body: "test error",
      });
      result = await handler(getTasksEvent);
    });

    it("should return a 500 response", () => {
      expect(result.statusCode).toBe(500);
    });

    it("should return the error", () => {
      expect(result.body).toMatchSnapshot();
    });
  });
});
