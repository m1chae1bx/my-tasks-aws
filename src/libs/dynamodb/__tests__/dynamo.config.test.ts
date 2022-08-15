import { getTableName } from "@libs/dynamodb";
import { EnvironmentConfigError } from "@libs/generic/errors";

describe("getTableName", () => {
  describe("happy path", () => {
    it("should return the table name", () => {
      process.env.MY_TASKS_TABLE = "test-table";
      expect(getTableName()).toEqual("test-table");
    });
  });

  describe("sad path - env var not defined", () => {
    it("should throw an EnvironmentConfigError", () => {
      delete process.env.MY_TASKS_TABLE;
      expect(() => getTableName()).toThrow();
    });
  });
});
