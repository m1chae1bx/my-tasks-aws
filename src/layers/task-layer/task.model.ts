import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { PromiseResult } from "aws-sdk/lib/request";
import { create, getAll } from "./task.dao";

export class Task {
  id?: string;
  listId: string;
  name: string;
  isCompleted: boolean;
  dueDate: Date;
  desc: string;

  constructor(
    listId: string,
    name: string,
    isCompleted: boolean,
    dueDate: Date,
    desc: string,
    id?: string
  ) {
    this.id = id;
    this.listId = listId;
    this.name = name;
    this.isCompleted = isCompleted;
    this.dueDate = dueDate;
    this.desc = desc;
  }

  save(): Promise<string> {
    return create(this);
  }

  static getAll = async (
    listId: string,
    query: APIGatewayProxyEventQueryStringParameters | null
  ): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> => {
    return getAll(listId, query);
  };
}

// Task.prototype.create = function() {
//   const task = {
//     name: this.name,
//     listId: this.listId,
//     isCompleted: this.isCompleted,
//     dueDate: this.dueDate,
//     desc: this.desc
//   }
//   return TaskDao.create(task);
// }

// Task.prototype.update = function() {
//   const task = {
//     id: this.id,
//     listId: this.listId,
//     name: this.name,
//     isCompleted: this.isCompleted,
//     dueDate: this.dueDate,
//     desc: this.desc
//   }
//   return TaskDao.update(task);
// }

// Task.prototype.delete = function() {
//   return TaskDao.delete(this.id, this.listId);
// }

// module.exports = Task;
