import { Task } from "../task.model";
import { testTask } from "../test-data";
import * as TaskDao from "../task.dao";
import { ErrorCode, RequiredPropertyMissingError } from "/opt/nodejs/errors";

jest.mock("../task.dao", () => ({
  ...jest.requireActual("../task.dao"),
  create: jest.fn(),
  update: jest.fn(),
  getAll: jest.fn(),
  deleteTask: jest.fn(),
}));

jest.useFakeTimers().setSystemTime(new Date("2022-01-01"));

describe("Task", () => {
  describe("constructor", () => {
    it("should initialize a task", () => {
      const { id, listId, name, isCompleted, dueDate, desc } = testTask;
      const task = new Task(
        listId,
        name,
        isCompleted,
        dueDate?.toISOString(),
        desc,
        id
      );
      expect(task.id).toBe(id);
      expect(task.listId).toBe(listId);
      expect(task.name).toBe(name);
      expect(task.isCompleted).toBe(isCompleted);
      expect(task.dueDate?.toISOString()).toBe(dueDate?.toISOString());
      expect(task.desc).toBe(desc);
    });
  });

  describe("object methods", () => {
    let task: Task;

    beforeEach(() => {
      const { id, listId, name, isCompleted, dueDate, desc } = testTask;
      task = new Task(
        listId,
        name,
        isCompleted,
        dueDate?.toISOString(),
        desc,
        id
      );
    });

    describe("save", () => {
      it("should return the task ID", async () => {
        (TaskDao.create as jest.Mock)
          .mockClear()
          .mockResolvedValueOnce("test-task-id");
        const result = await task.save();
        expect(result).toBe("test-task-id");
      });
    });

    describe("update - happy path", () => {
      it("should call TaskDao.update", async () => {
        (TaskDao.update as jest.Mock).mockClear();
        await task.update();
        expect((TaskDao.update as jest.Mock).mock.calls).toMatchSnapshot();
      });
    });

    describe("update - missing ID", () => {
      it("should throw an error", async () => {
        task.id = undefined;
        try {
          await task.update();
        } catch (error) {
          expect((error as RequiredPropertyMissingError).errorCode).toBe(
            ErrorCode.REQUIRED_PROPERTY_MISSING
          );
        }
      });
    });
  });

  describe("static getAll", () => {
    it("should return a list of tasks", async () => {
      (TaskDao.getAll as jest.Mock)
        .mockClear()
        .mockResolvedValueOnce([testTask]);
      const result = await Task.getAll("test-list-id", {});
      expect(result[0]).toEqual(testTask);
    });
  });

  describe("static delete", () => {
    it("should call TaskDao.delete", async () => {
      (TaskDao.deleteTask as jest.Mock).mockClear().mockResolvedValueOnce(null);
      await Task.delete("test-task-id", "test-list-id");
      expect((TaskDao.deleteTask as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });
});
