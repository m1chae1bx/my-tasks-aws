import {
  completedTask,
  getTasksQuery,
  testTask,
  testTasks,
} from "../test-data";
import { dynamoClient } from "@libs/dynamodb";
import { CustomError, ErrorCode } from "@libs/generic/errors";
import * as TaskDao from "../task.dao";
import { isAWSError } from "@libs/generic/util";
import { DueDate } from "../task.model";

jest.mock("@libs/dynamodb", () => ({
  dynamoClient: {
    put: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
    transactWrite: jest.fn(),
  },
  getTableName: jest.fn().mockReturnValue("test-table-name"),
}));

jest.mock("@libs/generic/util", () => ({
  ...jest.requireActual("@libs/generic/util"),
  isAWSError: jest.fn(),
  uuid: jest.fn().mockReturnValue("test-uuid"),
}));

describe("create", () => {
  describe("happy path", () => {
    it("should return the task ID", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });
      const result = await TaskDao.create(testTask);
      expect(result).toBe("test-uuid");
    });
  });

  describe("sad path - ID already exists", () => {
    let result: unknown;

    beforeAll(async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValue(true);
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());
      try {
        await TaskDao.create(testTask);
      } catch (error) {
        result = error;
      }
    });

    it("should throw an error", () => {
      expect((result as CustomError).errorCode).toBe(
        ErrorCode.ID_ALREADY_EXISTS
      );
    });

    it("should log an error", async () => {
      expect(jest.spyOn(console, "error").mock.calls).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB put unknown error", () => {
    it("should throw an error", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("test-error")),
      });

      try {
        await TaskDao.create(testTask);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });
});

describe("getAll", () => {
  describe("happy path", () => {
    it("should return a list of tasks", async () => {
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: testTasks,
        }),
      });
      const result = await TaskDao.getAll("test-list-id", getTasksQuery);
      expect(result).toEqual(testTasks);
    });
  });

  describe("happy path - not including completed", () => {
    it("should return a list of tasks", async () => {
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: testTasks,
        }),
      });
      const result = await TaskDao.getAll("test-list-id", {
        ...getTasksQuery,
        includeCompleted: undefined,
      });
      expect(result).toEqual(testTasks);
    });
  });

  describe("happy path - no items", () => {
    it("should return an empty list", async () => {
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: undefined,
        }),
      });
      const result = await TaskDao.getAll("test-list-id", getTasksQuery);
      expect(result).toEqual([]);
    });
  });

  describe("happy path - due date tomorrow", () => {
    it("should call DynamoDB query", async () => {
      jest.clearAllMocks();
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: testTasks,
        }),
      });
      await TaskDao.getAll("test-list-id", {
        ...getTasksQuery,
        dueDate: DueDate.TOMORROW,
      });
      expect((dynamoClient.query as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });

  describe("happy path - due date upcoming", () => {
    it("should call DynamoDB query", async () => {
      jest.clearAllMocks();
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: testTasks,
        }),
      });
      await TaskDao.getAll("test-list-id", {
        ...getTasksQuery,
        dueDate: DueDate.UPCOMING,
      });
      expect((dynamoClient.query as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });

  describe("happy path - due date overdue", () => {
    it("should call DynamoDB query", async () => {
      jest.clearAllMocks();
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: testTasks,
        }),
      });
      await TaskDao.getAll("test-list-id", {
        ...getTasksQuery,
        dueDate: DueDate.OVERDUE,
      });
      expect((dynamoClient.query as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });

  describe("happy path - due date unplanned", () => {
    it("should call DynamoDB query", async () => {
      jest.clearAllMocks();
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: testTasks,
        }),
      });
      await TaskDao.getAll("test-list-id", {
        ...getTasksQuery,
        dueDate: DueDate.UNPLANNED,
      });
      expect((dynamoClient.query as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });
});

describe("update", () => {
  describe("happy path - task completed", () => {
    it("should call DynamoDB transactWrite", async () => {
      jest.spyOn(dynamoClient, "transactWrite").mockClear();
      (dynamoClient.transactWrite as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });
      await TaskDao.update(completedTask);
      expect(
        jest.spyOn(dynamoClient, "transactWrite").mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("happy path - active task", () => {
    it("should call DynamoDB put", async () => {
      jest.spyOn(dynamoClient, "put").mockClear();
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });
      await TaskDao.update(testTask);
      expect(jest.spyOn(dynamoClient, "put").mock.calls).toMatchSnapshot();
    });
  });

  describe("happy path - task reopened", () => {
    it("should call DynamoDB transactWrite", async () => {
      jest.spyOn(dynamoClient, "transactWrite").mockClear();
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (dynamoClient.transactWrite as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValue(true);
      await TaskDao.update(testTask);
      expect(
        jest.spyOn(dynamoClient, "transactWrite").mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("sad path - missing id", () => {
    it("should throw an error", async () => {
      try {
        await TaskDao.update({ ...testTask, id: undefined });
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.REQUIRED_PROPERTY_MISSING
        );
      }
    });
  });

  describe("sad path - failed updating active task", () => {
    it("should throw an error", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
      });
      try {
        await TaskDao.update(testTask);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  describe("sad path - failed updating reopened task", () => {
    it("should throw an error", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (dynamoClient.transactWrite as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValue(true);
      try {
        await TaskDao.update(testTask);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  describe("sad path - updating reopened task, task not found", () => {
    it("should throw an error", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (dynamoClient.transactWrite as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValue(true);
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());
      try {
        await TaskDao.update(testTask);
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.TASK_NOT_FOUND_ERROR
        );
      }
    });
  });
});

describe("deleteTask", () => {
  describe("happy path - delete active task", () => {
    it("should call DynamoDB delete operation", async () => {
      jest.spyOn(dynamoClient, "delete").mockClear();
      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });
      await TaskDao.deleteTask("test-task-id", "test-list-id");
      expect(jest.spyOn(dynamoClient, "delete").mock.calls).toMatchSnapshot();
    });
  });

  describe("happy path - delete completed task", () => {
    it("should call DynamoDB delete operation", async () => {
      jest.spyOn(dynamoClient, "delete").mockClear();
      (dynamoClient.delete as jest.Mock)
        .mockReturnValueOnce({
          promise: jest.fn().mockRejectedValueOnce({
            code: "ConditionalCheckFailedException",
          }),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(null),
        });
      (isAWSError as unknown as jest.Mock).mockReturnValue(true);
      await TaskDao.deleteTask("test-task-id", "test-list-id");
      expect(jest.spyOn(dynamoClient, "delete").mock.calls).toMatchSnapshot();
    });
  });

  describe("delete active task unknown error", () => {
    it("should throw an error", async () => {
      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
      });
      try {
        await TaskDao.deleteTask("test-task-id", "test-list-id");
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  describe("delete completed task unknown error", () => {
    it("should throw an error", async () => {
      (dynamoClient.delete as jest.Mock)
        .mockReturnValueOnce({
          promise: jest.fn().mockRejectedValueOnce({
            code: "ConditionalCheckFailedException",
          }),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
        });
      (isAWSError as unknown as jest.Mock).mockReturnValue(true);
      try {
        await TaskDao.deleteTask("test-task-id", "test-list-id");
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  describe("sad path - task not found error", () => {
    it("should throw an error", async () => {
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());
      (dynamoClient.delete as jest.Mock)
        .mockReturnValueOnce({
          promise: jest.fn().mockRejectedValueOnce({
            code: "ConditionalCheckFailedException",
          }),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockRejectedValueOnce({
            code: "ConditionalCheckFailedException",
          }),
        });
      (isAWSError as unknown as jest.Mock).mockReturnValue(true);
      try {
        await TaskDao.deleteTask("test-task-id", "test-list-id");
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.TASK_NOT_FOUND_ERROR
        );
      }
    });
  });
});
