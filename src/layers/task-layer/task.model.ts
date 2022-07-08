import { create, deleteTask, getAll, update } from "./task.dao";
import { RequiredPropertyMissingError } from "/opt/nodejs/errors";

export interface TaskDetails {
  id?: string;
  listId: string;
  name: string;
  isCompleted: boolean;
  dueDate?: Date;
  desc?: string;
}

export class Task implements TaskDetails {
  id?: string;
  listId: string;
  name: string;
  isCompleted: boolean;
  dueDate?: Date;
  desc?: string;

  constructor(
    listId: string,
    name: string,
    isCompleted = false,
    dueDate?: string,
    desc?: string,
    id?: string
  ) {
    this.id = id;
    this.listId = listId;
    this.name = name;
    this.isCompleted = isCompleted;
    this.dueDate = dueDate ? new Date(dueDate) : undefined;
    this.desc = desc;
  }

  async save(): Promise<string> {
    this.id = await create(this);
    return this.id;
  }

  update(): Promise<void> {
    if (!this.id) throw new RequiredPropertyMissingError("id");
    const task = {
      id: this.id,
      listId: this.listId,
      name: this.name,
      isCompleted: this.isCompleted,
      dueDate: this.dueDate,
      desc: this.desc,
    };
    return update(task);
  }

  static getAll = async (
    listId: string,
    query: GetTasksQuery
  ): Promise<TaskDetails[]> => {
    return getAll(listId, query);
  };

  static delete = async (taskId: string, listId: string): Promise<void> => {
    await deleteTask(taskId, listId);
  };
}

export interface GetTasksQuery {
  name?: string;
  dueDate?: DueDate;
  today?: string;
  includeCompleted?: "true";
}

export enum DueDate {
  TODAY = "today",
  TOMORROW = "tomorrow",
  UPCOMING = "upcoming",
  OVERDUE = "overdue",
  UNPLANNED = "unplanned",
}
