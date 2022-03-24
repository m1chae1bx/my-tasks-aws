import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PromiseResult } from "aws-sdk/lib/request";
import { create, deleteList, getAll } from "./list.dao";

export class List {
  id?: string;
  name: string;
  userId: string;
  isDefault: boolean;

  constructor(name: string, userId: string, isDefault = false, id?: string) {
    this.id = id;
    this.name = name;
    this.userId = userId;
    this.isDefault = isDefault;
  }

  save(): Promise<
    | string
    | PromiseResult<DocumentClient.PutItemOutput, AWSError>
    | PromiseResult<DocumentClient.TransactWriteItemsOutput, AWSError>
  > {
    return create(this);
  }

  static delete = async (
    listId: string,
    userId: string
  ): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> => {
    return deleteList(listId, userId);
  };

  static getAll = (
    userId: string
  ): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> =>
    getAll(userId);
}

// List.prototype.update = function() {
//   const list = {
//     id: this.id,
//     name: this.name,
//     userId: this.userId
//   };
//   return ListDao.update(list);
// }

// List.prototype.delete = function() {
//   return ListDao.delete(this.id, this.userId);
// };

// List.get = (id, userId) => ListDao.get(id, userId);

// module.exports = List;
