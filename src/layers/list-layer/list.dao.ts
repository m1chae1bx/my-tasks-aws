import { uuid } from "/opt/nodejs/util";
import { dynamoClient, TABLE_NAME } from "/opt/nodejs/dynamo.config";
import { List } from "./list.model";
import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PromiseResult } from "aws-sdk/lib/request";

export const create = async (
  list: List
): Promise<
  | PromiseResult<DocumentClient.PutItemOutput, AWSError>
  | PromiseResult<DocumentClient.TransactWriteItemsOutput, AWSError>
  | string
> => {
  if (!list) throw { message: "Invalid list object" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  const { name, userId, isDefault } = list;

  if (!name) throw { message: "Name is required" };
  if (!userId) throw { message: "User ID is required" };

  const id = uuid();

  if (isDefault) {
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: `USER#${userId}`,
              SK: `LIST#${id}`,
              id: id,
              name: name,
            },
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },
        {
          Update: {
            TableName: TABLE_NAME,
            Key: {
              PK: `USER#${userId}`,
              SK: `USER#${userId}`,
            },
            UpdateExpression: "set preferences.defaultListId = :id",
            ExpressionAttributeValues: {
              ":id": id,
            },
          },
        },
      ],
    };

    return dynamoClient
      .transactWrite(params)
      .promise()
      .then(() => id)
      .catch((err) => {
        if (err.code === "ConditionalCheckFailedException") {
          err.message = `List ${id} is already existing`;
        }
        throw err;
      });
  } else {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `LIST#${id}`,
        id: id,
        name: name,
      },
      ConditionExpression: "attribute_not_exists(PK)",
    };

    return dynamoClient
      .put(params)
      .promise()
      .then(() => id)
      .catch((err) => {
        if (err.code === "ConditionalCheckFailedException") {
          err.message = `List ${id} is already existing`;
        }
        throw err;
      });
  }
};

export const deleteList = (
  listId: string,
  userId: string
): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> => {
  if (!listId) throw { message: "List ID is required" };
  if (!userId) throw { message: "User ID is required" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `LIST#${listId}`,
    },
    ConditionExpression: "attribute_exists(PK)",
  };

  return dynamoClient
    .delete(params)
    .promise()
    .catch((err) => {
      if (err.code === "ConditionalCheckFailedException") {
        err.message = `List ${listId} of user ${userId} was not found`;
      }
      throw err;
    });
};

export const getAll = async (
  userId: string
): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> => {
  if (!userId) throw { message: "User ID is required" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :PK and begins_with(#SK, :SK)",
    ProjectionExpression: "id, #name",
    ExpressionAttributeNames: {
      "#SK": "SK",
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":PK": `USER#${userId}`,
      ":SK": `LIST#`,
    },
  };

  return dynamoClient.query(params).promise();
};
