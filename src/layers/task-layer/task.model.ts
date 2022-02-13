import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { PromiseResult } from "aws-sdk/lib/request";
import { create, deleteTask, getAll, update } from "./task.dao";

export class Task {
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

  save(): Promise<string> {
    return create(this);
  }

  update(): Promise<
    | PromiseResult<DocumentClient.TransactWriteItemsOutput, AWSError>
    | PromiseResult<DocumentClient.PutItemOutput, AWSError>
  > {
    if (!this.id) throw { message: "Invalid task ID" };
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
    query: APIGatewayProxyEventQueryStringParameters & GetTasksQuery
  ): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> => {
    return getAll(listId, query);
  };

  static delete = async (
    taskId: string,
    listId: string
  ): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> => {
    return deleteTask(taskId, listId);
  };
}

export interface GetTasksQuery {
  name?: string;
  dueDate?: string;
  today?: string;
  includeCompleted?: "true";
}
