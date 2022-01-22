import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PromiseResult } from "aws-sdk/lib/request";
import {
  dynamoClient,
  TABLE_NAME,
  EMAIL_INDEX,
} from "/opt/nodejs/dynamo.config";
import { User, UserDetails } from "./user.model";

export const create = async (user: UserDetails): Promise<string> => {
  if (!user) throw { message: "Empty user object" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${user.id}`,
      SK: `USER#${user.id}`,
      ...user,
    },
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await dynamoClient.put(params).promise(); // TODO why am I not returning the promise as with other functions
    return user.id;
  } catch (err: any) {
    if (err.code === "ConditionalCheckFailedException") {
      err.message = `User ${user.id} is already existing`;
    }
    throw err;
  }
};

export const deleteUser = async (
  id: string
): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> => {
  if (!id) throw { message: "ID is required" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${id}`,
      SK: `USER#${id}`,
    },
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    return dynamoClient.delete(params).promise();
  } catch (err: any) {
    if (err.code === "ConditionalCheckFailedException") {
      err.message = `User ${id} was not found`;
    }
    throw err;
  }
};

export const patch = (
  userPartial: Partial<User>
): Promise<PromiseResult<DocumentClient.UpdateItemOutput, AWSError>> => {
  if (!userPartial) throw { message: "Empty user object" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  let id: string;
  if (!userPartial.id) {
    throw { message: "ID is required" };
  } else {
    id = userPartial.id;
    delete userPartial.id;
  }

  let updateExpression = "set";
  const expressionAttributeValues: {
    ":f"?: string;
    ":n"?: string;
    ":d"?: string;
  } = {};

  if (userPartial.fullName) {
    updateExpression += " fullName = :f,";
    expressionAttributeValues[":f"] = userPartial.fullName;
  }
  if (userPartial.nickname) {
    updateExpression += " nickname = :n,";
    expressionAttributeValues[":n"] = userPartial.nickname;
  }
  if (userPartial.preferences?.defaultListId) {
    updateExpression += " preferences.defaultListId = :d,";
    expressionAttributeValues[":d"] = userPartial.preferences.defaultListId;
  }
  updateExpression = updateExpression.slice(0, -1);

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${id}`,
      SK: `USER#${id}`,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: "attribute_exists(PK)",
  };

  return dynamoClient
    .update(params)
    .promise()
    .catch((err) => {
      if (err.code === "ConditionalCheckFailedException") {
        err.message = `User ${id} was not found`;
      }
      if (err.code === "ValidationException") {
        err.message = "Invalid user object";
      }
      throw err;
    });
};

export const get = async (
  id: string
): Promise<DocumentClient.AttributeMap | undefined> => {
  if (!id) throw { message: "ID is required" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${id}`,
      SK: `USER#${id}`,
    },
    ProjectionExpression:
      "id, email, nickname, fullName, #hash, salt, preferences",
    ExpressionAttributeNames: {
      "#hash": "hash",
    },
  };

  const data = await dynamoClient.get(params).promise();
  return data.Item;
};

export const getByEmail = async (
  email: string
): Promise<DocumentClient.AttributeMap | undefined> => {
  if (!email) throw { message: "Email is required" };
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };

  const params = {
    TableName: TABLE_NAME,
    IndexName: EMAIL_INDEX,
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
    Limit: 1,
  };

  const data = await dynamoClient.query(params).promise();
  return data && data.Items ? data.Items[0] : undefined;
};
