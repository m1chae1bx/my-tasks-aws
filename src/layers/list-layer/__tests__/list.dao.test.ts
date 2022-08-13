import { create, deleteList, getAll } from "../list.dao";
import { testList, testLists } from "../test-data";
import { dynamoClient } from "/opt/nodejs/dynamo.config";
import { ErrorCode } from "/opt/nodejs/errors";
import { isAWSError } from "/opt/nodejs/util";

jest.mock("/opt/nodejs/dynamo.config", () => ({
  dynamoClient: {
    transactWrite: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
  },
  getTableName: jest.fn().mockReturnValue("test-table-name"),
}));

jest.mock("/opt/nodejs/util", () => ({
  isAWSError: jest.fn(),
  uuid: jest.fn().mockReturnValue("test-list-id"),
}));

describe("create", () => {
  describe("happy path - default list", () => {
    it("should return an id", async () => {
      (dynamoClient.transactWrite as jest.Mock).mockReturnValueOnce({
        promise: jest.fn(),
      });
      const result = await create({
        ...testList,
        id: undefined,
        isDefault: true,
      });
      expect(result).toEqual("test-list-id");
    });
  });

  describe("happy path - regular list", () => {
    it("should return an id", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn(),
      });
      const result = await create({
        ...testList,
        id: undefined,
        isDefault: false,
      });
      expect(result).toEqual("test-list-id");
    });
  });

  describe("sad path - default list ID already exists", () => {
    it("should throw an error", async () => {
      (dynamoClient.transactWrite as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValueOnce(true);
      jest.spyOn(console, "error").mockImplementation(jest.fn());
      await expect(
        create({
          ...testList,
          id: undefined,
          isDefault: true,
        })
      ).rejects.toEqual(
        expect.objectContaining({
          errorCode: ErrorCode.ID_ALREADY_EXISTS,
        })
      );
    });
  });

  describe("sad path - default list unknown error", () => {
    it("should throw an error", async () => {
      (dynamoClient.transactWrite as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValueOnce(false);
      await expect(
        create({
          ...testList,
          id: undefined,
          isDefault: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("sad path - regular list ID already exists", () => {
    it("should throw an error", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValueOnce(true);
      jest.spyOn(console, "error").mockImplementation(jest.fn());
      await expect(
        create({
          ...testList,
          id: undefined,
          isDefault: false,
        })
      ).rejects.toEqual(
        expect.objectContaining({
          errorCode: ErrorCode.ID_ALREADY_EXISTS,
        })
      );
    });
  });

  describe("sad path - regular list unknown error", () => {
    it("should throw an error", async () => {
      (dynamoClient.put as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValueOnce(false);
      await expect(
        create({
          ...testList,
          id: undefined,
          isDefault: false,
        })
      ).rejects.toThrow();
    });
  });
});

describe("deleteList", () => {
  describe("happy path", () => {
    it("should call DynamoDB delete", () => {
      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest.fn(),
      });
      const deleteSpy = jest.spyOn(dynamoClient, "delete").mockClear();
      deleteList("test-list-id", testList.userId);
      expect(deleteSpy.mock.calls).toMatchSnapshot();
    });
  });

  describe("sad path - list not found", () => {
    it("should throw an error", async () => {
      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce({
          code: "ConditionalCheckFailedException",
        }),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValueOnce(true);
      jest.spyOn(console, "error").mockImplementation(jest.fn());
      await expect(deleteList("test-list-id", testList.userId)).rejects.toEqual(
        expect.objectContaining({
          errorCode: ErrorCode.LIST_NOT_FOUND,
        })
      );
    });
  });

  describe("sad path - unknown error", () => {
    it("should throw an error", async () => {
      (dynamoClient.delete as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("test error")),
      });
      (isAWSError as unknown as jest.Mock).mockReturnValueOnce(false);
      await expect(
        deleteList("test-list-id", testList.userId)
      ).rejects.toThrow();
    });
  });
});

describe("getAll", () => {
  describe("happy path", () => {
    it("should return a list of all lists", async () => {
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: testLists,
        }),
      });
      const result = await getAll(testList.userId);
      expect(result).toEqual(testLists);
    });
  });

  describe("happy path - no items found", () => {
    it("should return an empty list", async () => {
      (dynamoClient.query as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValueOnce({
          Items: undefined,
        }),
      });
      const result = await getAll(testList.userId);
      expect(result).toEqual([]);
    });
  });
});
