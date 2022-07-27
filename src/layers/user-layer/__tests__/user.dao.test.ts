import { conditionalCheckFailedException } from "@test-utils/base-objects";
import { testUserInit } from "../test-data/test-user-init";
import { dynamoClient } from "/opt/nodejs/dynamo.config";
import {
  EnvironmentConfigError,
  ErrorCode,
  RequiredPropertyMissingError,
  UserNotFoundError,
} from "/opt/nodejs/errors";
import * as UserDao from "../user.dao";

jest.mock("/opt/nodejs/dynamo.config", () => ({
  dynamoClient: {
    put: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
  },
  getTableName: jest.fn().mockReturnValue("test-table-name"),
  EMAIL_INDEX: "test-email-index",
}));

describe("create", () => {
  describe("happy path", () => {
    it("should return the user ID", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await UserDao.create(testUserInit);
      expect(result).toBe(testUserInit.id);
    });
  });

  describe("sad path - username unavailable", () => {
    let err: unknown;

    beforeAll(async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest
          .fn()
          .mockRejectedValueOnce(conditionalCheckFailedException),
      });
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        await UserDao.create(testUserInit);
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

      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("error")),
      });
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        await UserDao.create(testUserInit);
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
      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");

      await UserDao.deleteUser(testUserInit.id);
      expect((dynamoClient.delete as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });

  describe("sad path - user not found", () => {
    let err: unknown;

    beforeAll(async () => {
      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest
          .fn()
          .mockRejectedValueOnce(conditionalCheckFailedException),
      });
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());
      try {
        await UserDao.deleteUser(testUserInit.id);
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

      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("error")),
      });
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        await UserDao.deleteUser(testUserInit.id);
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
      (dynamoClient.update as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce(null),
      });
      const dynamoConfig = await import("/opt/nodejs/dynamo.config");

      await UserDao.patch(testUserInit);
      expect((dynamoClient.update as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });

  describe("sad path - missing ID", () => {
    it("should throw a RequiredPropertyMissingError error", async () => {
      let err: unknown;

      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        await UserDao.patch({ ...testUserInit, id: undefined });
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
      (dynamoClient.update as jest.Mock).mockReturnValueOnce({
        promise: jest
          .fn()
          .mockRejectedValueOnce(conditionalCheckFailedException),
      });
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        await UserDao.patch(testUserInit);
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

      (dynamoClient.update as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("error")),
      });
      jest
        .spyOn(console, "error")
        .mockClear()
        .mockImplementationOnce(jest.fn());

      try {
        await UserDao.patch(testUserInit);
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
      (dynamoClient.get as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Item: testUserInit,
        }),
      });

      expect(await UserDao.get(testUserInit.id)).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB get unknown error", () => {
    it("should throw an error", async () => {
      let err: unknown;

      (dynamoClient.get as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("error")),
      });

      try {
        await UserDao.get(testUserInit.id);
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
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: [testUserInit],
        }),
      });

      expect(await UserDao.getByEmail(testUserInit.email)).toMatchSnapshot();
    });
  });

  describe("sad path - DynamoDB get unknown error", () => {
    it("should throw an error", async () => {
      let err: unknown;

      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("error")),
      });

      try {
        await UserDao.getByEmail(testUserInit.email);
      } catch (error) {
        err = error;
      }
      expect(err).toMatchSnapshot();
    });
  });
});
