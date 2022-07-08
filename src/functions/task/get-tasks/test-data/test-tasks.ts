import { Task } from "/opt/nodejs/task.model";

export const testTasks: Partial<Task>[] = [
  {
    id: "test-task-id-1",
    name: "test-task-name-2",
    desc: "test-task-desc",
    isCompleted: false,
    dueDate: new Date("2020-01-01T00:00:00.000Z"),
    listId: "test-list-id",
  },
  {
    id: "test-task-id-2",
    name: "test-task-name-2",
    desc: "test-task-desc",
    isCompleted: true,
    dueDate: new Date("2020-01-01T00:00:00.000Z"),
    listId: "test-list-id",
  },
];
