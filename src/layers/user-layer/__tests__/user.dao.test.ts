import { conditionalCheckFailedException } from "@test-utils/base-objects";
import { testUserInit } from "../test-data/test-user-init";
import {
  EnvironmentConfigError,
  ErrorCode,
  RequiredPropertyMissingError,
  UserNotFoundError,
} from "/opt/nodejs/errors";

describe("create", () => {
  describe("happy path", () => {
    it("should return the user ID", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(null),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const userDao = await import("../user.dao");
      const result = await userDao.create(testUserInit);
      expect(result).toBe(testUserInit.id);
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw a EnvironmentConfigError error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        TABLE_NAME: undefined,
      }));

      try {
        const userDao = await import("../user.dao");
        await userDao.create(testUserInit);
      } catch (error) {
        err = error;
      }

      expect((err as EnvironmentConfigError).errorCode).toBe(
        ErrorCode.ENVIRONMENT_CONFIG_ERROR
      );
    });
  });

  describe("sad path - username unavailable", () => {
    let err: unknown;

    beforeAll(async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest
              .fn()
              .mockRejectedValueOnce(conditionalCheckFailedException),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        const userDao = await import("../user.dao");
        await userDao.create(testUserInit);
      } catch (error) {
        err = error;
      }
    });

    it("should throw an error", async () => {
      expect(err).toMatchSnapshot();
    });

    it("should log error", () => {
      expect(jest.spyOn(console, "error").mock.calls).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB put unknown error", () => {
    it("should throw an error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        const userDao = await import("../user.dao");
        await userDao.create(testUserInit);
      } catch (error) {
        err = error;
      }

      expect(err).toMatchSnapshot();
    });
  });
});

describe("deleteUser", () => {
  describe("happy path", () => {
    it("should call DynamoDB delete", async () => {
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
      const userDao = await import("../user.dao");
      await userDao.deleteUser(testUserInit.id);
      expect(
        (dynamoConfig.dynamoClient.delete as jest.Mock).mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw a EnvironmentConfigError error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        TABLE_NAME: undefined,
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        const userDao = await import("../user.dao");
        await userDao.deleteUser(testUserInit.id);
      } catch (error) {
        err = error;
      }

      expect((err as EnvironmentConfigError).errorCode).toBe(
        ErrorCode.ENVIRONMENT_CONFIG_ERROR
      );
    });
  });

  describe("sad path - user not found", () => {
    let err: unknown;

    beforeAll(async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          delete: jest.fn().mockReturnValueOnce({
            promise: jest
              .fn()
              .mockRejectedValueOnce(conditionalCheckFailedException),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());
      try {
        const userDao = await import("../user.dao");
        await userDao.deleteUser(testUserInit.id);
      } catch (error) {
        err = error;
      }
    });

    it("should throw a UserNotFoundError error", () => {
      expect((err as UserNotFoundError).errorCode).toBe(
        ErrorCode.USER_NOT_FOUND
      );
    });

    it("should log error", () => {
      expect(jest.spyOn(console, "error").mock.calls).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB delete unknown error", () => {
    it("should throw an error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          delete: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        const userDao = await import("../user.dao");
        await userDao.deleteUser(testUserInit.id);
      } catch (error) {
        err = error;
      }
      expect(err).toMatchSnapshot();
    });
  });
});

describe("patch", () => {
  describe("happy path", () => {
    it("should call DynamoDB update", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          update: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(null),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");
      const userDao = await import("../user.dao");
      await userDao.patch(testUserInit);
      expect(
        (dynamoConfig.dynamoClient.update as jest.Mock).mock.calls
      ).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw a EnvironmentConfigError error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        TABLE_NAME: undefined,
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        const userDao = await import("../user.dao");
        await userDao.patch(testUserInit);
      } catch (error) {
        err = error;
      }

      expect((err as EnvironmentConfigError).errorCode).toBe(
        ErrorCode.ENVIRONMENT_CONFIG_ERROR
      );
    });
  });

  describe("sad path - missing ID", () => {
    it("should throw a RequiredPropertyMissingError error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        TABLE_NAME: "test-table-name",
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        const userDao = await import("../user.dao");
        await userDao.patch({ ...testUserInit, id: undefined });
      } catch (error) {
        err = error;
      }

      expect((err as RequiredPropertyMissingError).errorCode).toBe(
        ErrorCode.REQUIRED_PROPERTY_MISSING
      );
    });
  });

  describe("sad path - user not found", () => {
    let err: unknown;

    beforeAll(async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          update: jest.fn().mockReturnValueOnce({
            promise: jest
              .fn()
              .mockRejectedValueOnce(conditionalCheckFailedException),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());
      const userDao = await import("../user.dao");
      try {
        await userDao.patch(testUserInit);
      } catch (error) {
        err = error;
      }
    });

    it("should throw a UserNotFoundError error", async () => {
      expect((err as UserNotFoundError).errorCode).toBe(
        ErrorCode.USER_NOT_FOUND
      );
    });

    it("should log error", () => {
      expect(jest.spyOn(console, "error").mock.calls).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB patch unknown error", () => {
    it("should throw an error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          update: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        const userDao = await import("../user.dao");
        await userDao.patch(testUserInit);
      } catch (error) {
        err = error;
      }
      expect(err).toMatchSnapshot();
    });
  });
});

describe("get", () => {
  describe("happy path", () => {
    it("should return the user", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          get: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce({
              Item: testUserInit,
            }),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const userDao = await import("../user.dao");
      expect(await userDao.get(testUserInit.id)).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw a EnvironmentConfigError error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        TABLE_NAME: undefined,
      }));
      const userDao = await import("../user.dao");
      try {
        await userDao.get(testUserInit.id);
      } catch (error) {
        err = error;
      }

      expect((err as EnvironmentConfigError).errorCode).toBe(
        ErrorCode.ENVIRONMENT_CONFIG_ERROR
      );
    });
  });

  describe("sad path - DynamoDB get unknown error", () => {
    it("should throw an error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          get: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const userDao = await import("../user.dao");
      try {
        await userDao.get(testUserInit.id);
      } catch (error) {
        err = error;
      }
      expect(err).toMatchSnapshot();
    });
  });
});

describe("getByEmail", () => {
  describe("happy path", () => {
    it("should return the user", async () => {
      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          query: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce({
              Items: [testUserInit],
            }),
          }),
        },
        TABLE_NAME: "test-table-name",
        EMAIL_INDEX: "test-email-index",
      }));
      const userDao = await import("../user.dao");
      expect(await userDao.getByEmail(testUserInit.email)).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB table undefined", () => {
    it("should throw a EnvironmentConfigError error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        TABLE_NAME: undefined,
      }));
      const userDao = await import("../user.dao");
      try {
        await userDao.getByEmail(testUserInit.email);
      } catch (error) {
        err = error;
      }

      expect((err as EnvironmentConfigError).errorCode).toBe(
        ErrorCode.ENVIRONMENT_CONFIG_ERROR
      );
    });
  });

  describe("sad path - DynamoDB index undefined", () => {
    it("should throw a EnvironmentConfigError error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        TABLE_NAME: "test-table-name",
        EMAIL_INDEX: undefined,
      }));
      const userDao = await import("../user.dao");
      try {
        await userDao.getByEmail(testUserInit.email);
      } catch (error) {
        err = error;
      }

      expect((err as EnvironmentConfigError).errorCode).toBe(
        ErrorCode.ENVIRONMENT_CONFIG_ERROR
      );
    });
  });

  describe("sad path - DynamoDB get unknown error", () => {
    it("should throw an error", async () => {
      let err: unknown;

      jest.resetModules();
      jest.doMock("/opt/nodejs/dynamo.config", () => ({
        dynamoClient: {
          query: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockRejectedValueOnce(new Error("error")),
          }),
        },
        TABLE_NAME: "test-table-name",
      }));
      const userDao = await import("../user.dao");
      try {
        await userDao.getByEmail(testUserInit.email);
      } catch (error) {
        err = error;
      }
      expect(err).toMatchSnapshot();
    });
  });
});
