import {
  completedTask,
  getTasksQuery,
  testTask,
  testTasks,
} from "../test-data";
import { CustomError, ErrorCode } from "/opt/nodejs/errors";

describe("create", () => {
  describe("happy path", () => {
    it("should return the task ID", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(null),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest.doMock("/opt/nodejs/util", () => ({
        ...jest.requireActual("/opt/nodejs/util"),
        uuid: jest.fn().mockReturnValue("test-uuid"),
      }));
      const taskDao = await import("../task.dao");
      const result = await taskDao.create(testTask);
      expect(result).toBe("test-uuid");
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        ...jest.requireActual("/opt/nodejs/dynamo.config"),
        TABLE_NAME: undefined,
      }));
      jest.doMock("/opt/nodejs/util", () => ({
        ...jest.requireActual("/opt/nodejs/util"),
        uuid: jest.fn().mockReturnValue("test-uuid"),
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.create(testTask);
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.ENVIRONMENT_CONFIG_ERROR
        );
      }
    });
  });

  describe("sad path - ID already exists", () => {
    let result: unknown;

    beforeAll(async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce({
              code: "ConditionalCheckFailedException",
            }),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest.doMock("/opt/nodejs/util", () => ({
        isAWSError: jest.fn().mockReturnValue(true),
        uuid: jest.fn().mockReturnValue("test-uuid"),
      }));
      jest.spyOn(console, "error").mockClear();
      const taskDao = await import("../task.dao");
      try {
        await taskDao.create(testTask);
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
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("test-error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest.doMock("/opt/nodejs/util", () => ({
        ...jest.requireActual("/opt/nodejs/util"),
        uuid: jest.fn().mockReturnValue("test-uuid"),
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.create(testTask);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });
});

describe("getAll", () => {
  describe("happy path", () => {
    it("should return a list of tasks", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          query: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce({
              Items: testTasks,
            }),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest.doMock("/opt/nodejs/util", () => ({
        ...jest.requireActual("/opt/nodejs/util"),
        uuid: jest.fn().mockReturnValue("test-uuid"),
      }));
      const taskDao = await import("../task.dao");
      const result = await taskDao.getAll("test-list-id", getTasksQuery);
      expect(result).toEqual(testTasks);
    });
  });

  describe("happy path - no items", () => {
    it("should return an empty list", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          query: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce({
              Items: [],
            }),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest.doMock("/opt/nodejs/util", () => ({
        ...jest.requireActual("/opt/nodejs/util"),
        uuid: jest.fn().mockReturnValue("test-uuid"),
      }));
      const taskDao = await import("../task.dao");
      const result = await taskDao.getAll("test-list-id", getTasksQuery);
      expect(result).toEqual([]);
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        ...jest.requireActual("/opt/nodejs/dynamo.config"),
        TABLE_NAME: undefined,
      }));
      jest.doMock("/opt/nodejs/util", () => ({
        ...jest.requireActual("/opt/nodejs/util"),
        uuid: jest.fn().mockReturnValue("test-uuid"),
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.getAll("test-list-id", getTasksQuery);
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.ENVIRONMENT_CONFIG_ERROR
        );
      }
    });
  });
});

describe("update", () => {
  describe("happy path - task completed", () => {
    it("should call DynamoDB transactWrite", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          transactWrite: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(null),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");
      const taskDao = await import("../task.dao");
      jest.spyOn(dynamoConfig.dynamoClient, "transactWrite");
      await taskDao.update(completedTask);
      expect(
        jest.spyOn(dynamoConfig.dynamoClient, "transactWrite").mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("happy path - active task", () => {
    it("should call DynamoDB put", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(null),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");
      const taskDao = await import("../task.dao");
      jest.spyOn(dynamoConfig.dynamoClient, "put");
      await taskDao.update(testTask);
      expect(
        jest.spyOn(dynamoConfig.dynamoClient, "put").mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("happy path - task reopened", () => {
    it("should call DynamoDB transactWrite", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce({
              code: "ConditionalCheckFailedException",
            }),
          }),
          transactWrite: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(null),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");
      const taskDao = await import("../task.dao");
      jest.spyOn(dynamoConfig.dynamoClient, "transactWrite");
      await taskDao.update(testTask);
      expect(
        jest.spyOn(dynamoConfig.dynamoClient, "transactWrite").mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        ...jest.requireActual("/opt/nodejs/dynamo.config"),
        TABLE_NAME: undefined,
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.update(testTask);
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.ENVIRONMENT_CONFIG_ERROR
        );
      }
    });
  });

  describe("sad path - missing id", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        ...jest.requireActual("/opt/nodejs/dynamo.config"),
        TABLE_NAME: "test-table-name",
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.update({ ...testTask, id: undefined });
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.REQUIRED_PROPERTY_MISSING
        );
      }
    });
  });

  describe("sad path - failed updating active task", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.update(testTask);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  describe("sad path - failed updating reopened task", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce({
              code: "ConditionalCheckFailedException",
            }),
          }),
          transactWrite: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.update(testTask);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });
});

describe("deleteTask", () => {
  describe("happy path - delete active task", () => {
    it("should call DynamoDB delete operation", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          delete: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(null),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");
      const taskDao = await import("../task.dao");
      jest.spyOn(dynamoConfig.dynamoClient, "delete");
      await taskDao.deleteTask("test-task-id", "test-list-id");
      expect(
        jest.spyOn(dynamoConfig.dynamoClient, "delete").mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("happy path - delete completed task", () => {
    it("should call DynamoDB delete operation", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          delete: jest
            .fn()
            .mockReturnValueOnce({
              promise: jest.fn().mockRejectedValueOnce({
                code: "ConditionalCheckFailedException",
              }),
            })
            .mockReturnValueOnce({
              promise: jest.fn().mockResolvedValueOnce(null),
            }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");
      const taskDao = await import("../task.dao");
      jest.spyOn(dynamoConfig.dynamoClient, "delete");
      await taskDao.deleteTask("test-task-id", "test-list-id");
      expect(
        jest.spyOn(dynamoConfig.dynamoClient, "delete").mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        ...jest.requireActual("/opt/nodejs/dynamo.config"),
        TABLE_NAME: undefined,
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.deleteTask("test-task-id", "test-list-id");
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.ENVIRONMENT_CONFIG_ERROR
        );
      }
    });
  });

  describe("delete active task unknown error", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          delete: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.deleteTask("test-task-id", "test-list-id");
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  describe("delete completed task unknown error", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          delete: jest
            .fn()
            .mockReturnValueOnce({
              promise: jest.fn().mockRejectedValueOnce({
                code: "ConditionalCheckFailedException",
              }),
            })
            .mockReturnValueOnce({
              promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
            }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.deleteTask("test-task-id", "test-list-id");
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });

  describe("sad path - task not found error", () => {
    it("should throw an error", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          delete: jest
            .fn()
            .mockReturnValueOnce({
              promise: jest.fn().mockRejectedValueOnce({
                code: "ConditionalCheckFailedException",
              }),
            })
            .mockReturnValueOnce({
              promise: jest.fn().mockRejectedValueOnce({
                code: "ConditionalCheckFailedException",
              }),
            }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const taskDao = await import("../task.dao");
      try {
        await taskDao.deleteTask("test-task-id", "test-list-id");
      } catch (error) {
        expect((error as CustomError).errorCode).toBe(
          ErrorCode.TASK_NOT_FOUND_ERROR
        );
      }
    });
  });
});
