import { List } from "../list.model";
import { testList } from "../test-data";
import * as ListDao from "../list.dao";

jest.mock("../list.dao", () => ({
  ...jest.requireActual("../list.dao"),
  create: jest.fn(),
  deleteList: jest.fn(),
  getAll: jest.fn(),
}));

describe("List", () => {
  describe("constructor", () => {
    it("should initialize a list", () => {
      const { name, userId, isDefault } = testList;
      const list = new List(name, userId, isDefault);
      expect(list.name).toBe(name);
      expect(list.userId).toBe(userId);
      expect(list.isDefault).toBe(isDefault);
    });
  });

  describe("object methods", () => {
    let list: List;

    beforeEach(() => {
      const { name, userId, isDefault } = testList;
      list = new List(name, userId, isDefault);
    });

    describe("save", () => {
      it("should return the list ID", async () => {
        (ListDao.create as jest.Mock)
          .mockClear()
          .mockResolvedValueOnce("test-list-id");
        const result = await list.save();
        expect(result).toBe("test-list-id");
      });
    });
  });

  describe("static delete", () => {
    it("should call ListDao.delete", async () => {
      (ListDao.deleteList as jest.Mock).mockClear();
      await List.delete("test-list-id", "test-user-id");
      expect(ListDao.deleteList).toHaveBeenCalledWith(
        "test-list-id",
        "test-user-id"
      );
    });
  });

  describe("static getAll", () => {
    it("should call ListDao.getAll", async () => {
      (ListDao.getAll as jest.Mock).mockClear();
      await List.getAll("test-user-id");
      expect(ListDao.getAll).toHaveBeenCalledWith("test-user-id");
    });
  });
});
