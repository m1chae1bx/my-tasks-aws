import { DueDate, GetTasksQuery, TaskDetails } from "../task.model";

export const testTask: TaskDetails = {
  id: "test-task-id",
  listId: "test-list-id",
  name: "Test task",
  isCompleted: false,
  dueDate: new Date("2022-01-01"),
  desc: "Test task description",
};

export const completedTask: TaskDetails = {
  ...testTask,
  isCompleted: true,
};

export const testTasks: Partial<TaskDetails>[] = [
  {
    id: "test-task-id-1",
    name: "Test task 1",
    desc: "Test task description",
    isCompleted: false,
    dueDate: new Date("2020-01-01T00:00:00.000Z"),
    listId: "test-list-id",
  },
  {
    id: "test-task-id-2",
    name: "Test task 2",
    desc: "Test task description",
    isCompleted: true,
    dueDate: new Date("2020-01-01T00:00:00.000Z"),
    listId: "test-list-id",
  },
];

export const getTasksQuery: GetTasksQuery = {
  name: "Test task",
  dueDate: DueDate.TODAY,
  today: "2020-01-01",
  includeCompleted: "true",
};
