import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PromiseResult } from "aws-sdk/lib/request";
import { Task } from "./task.model";
import { dynamoClient, TABLE_NAME } from "/opt/nodejs/dynamo.config";
import { isAWSError, uuid } from "/opt/nodejs/util";

export const create = async (task: Task): Promise<string> => {
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };
  if (!task) throw { message: "Invalid task object" };
  if (!task.name) throw { message: "Name is required" };
  if (!task.listId) throw { message: "List ID is required" };

  const id = uuid();
  const item: {
    PK: string;
    SK: string;
    id: string;
    name: string;
    nameSearch: string;
    isCompleted?: boolean;
    dueDate?: Date;
    desc?: string;
  } = {
    PK: `LIST#${task.listId}`,
    SK: `TASK#active#${id}`,
    id: id,
    name: task.name,
    nameSearch: task.name.toLowerCase(),
  };

  if (task.isCompleted) item.isCompleted = task.isCompleted;
  if (task.dueDate) item.dueDate = task.dueDate;
  if (task.desc) item.desc = task.desc;

  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await dynamoClient.put(params).promise();
    return id;
  } catch (error) {
    if (isAWSError(error) && error.code === "ConditionalCheckFailedException") {
      error.message = `Task ${id} is already existing`;
    }
    throw error;
  }
};

export const getAll = async (
  listId: string,
  query: APIGatewayProxyEventQueryStringParameters | null
): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> => {
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };
  if (
    query &&
    ((!query.dueDate && query.today) || (query.dueDate && !query.today))
  ) {
    throw { message: "Due date and Today are required together" };
  }

  let filterExpression = "";
  const expressionAttributeNames = {
    "#SK": "SK",
    "#name": "name",
    "#desc": "desc",
  };
  const expressionAttributeValues: {
    ":PK": string;
    ":SK": string;
    ":name"?: string;
    ":dueDate"?: string;
  } = {
    ":PK": `LIST#${listId}`,
    ":SK": query?.includeCompleted ? `TASK#` : `TASK#active#`,
  };
  if (query?.name) {
    filterExpression = "contains(nameSearch, :name)";
    expressionAttributeValues[":name"] = query.name.toLowerCase();
  }
  if (query?.dueDate && query?.today) {
    const date = new Date(query.today);
    const dueDate = query.dueDate;
    if (filterExpression) filterExpression += " and ";
    if (dueDate === "today") {
      filterExpression += "dueDate = :dueDate";
      expressionAttributeValues[":dueDate"] = date.toISOString();
    } else if (dueDate === "tomorrow") {
      date.setDate(date.getDate() + 1);
      filterExpression += "dueDate = :dueDate";
      expressionAttributeValues[":dueDate"] = date.toISOString();
    } else if (dueDate === "upcoming") {
      date.setDate(date.getDate() + 1);
      filterExpression += "dueDate > :dueDate";
      expressionAttributeValues[":dueDate"] = date.toISOString();
    } else if (dueDate === "overdue") {
      filterExpression += "dueDate < :dueDate";
      expressionAttributeValues[":dueDate"] = date.toISOString();
    } else if (dueDate === "unplanned") {
      filterExpression += "attribute_not_exists(dueDate)";
    }
  }

  const params: DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :PK and begins_with(#SK, :SK)",
    ProjectionExpression: "id, #name, #desc, isCompleted, dueDate",
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (filterExpression) params.FilterExpression = filterExpression;

  const data = await dynamoClient.query(params).promise();
  if (data.Items) {
    data.Items.map((item) => {
      item.listId = listId;
      return item;
    });
  }
  return data;
};

export const update = async (
  task: Partial<Task>
): Promise<
  | PromiseResult<DocumentClient.TransactWriteItemsOutput, AWSError>
  | PromiseResult<DocumentClient.PutItemOutput, AWSError>
> => {
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };
  if (!task) throw { message: "Invalid task object" };
  if (!task.name) throw { message: "Name is required" };

  const id = task.id;
  const listId = task.listId;
  delete task.listId;

  if (task.isCompleted) {
    const params = {
      TransactItems: [
        {
          Delete: {
            TableName: TABLE_NAME,
            Key: {
              PK: `LIST#${listId}`,
              SK: `TASK#active#${id}`,
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: `LIST#${listId}`,
              SK: `TASK#${id}`,
              nameSearch: task.name.toLowerCase(),
              ...task,
            },
          },
        },
      ],
    };

    return dynamoClient.transactWrite(params).promise();
  } else {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        PK: `LIST#${listId}`,
        SK: `TASK#active#${id}`,
        ...task,
      },
      ConditionExpression: "attribute_exists(PK)",
    };

    try {
      return await dynamoClient.put(params).promise();
    } catch (error) {
      if (
        isAWSError(error) &&
        error.code === "ConditionalCheckFailedException"
      ) {
        const params = {
          TransactItems: [
            {
              Delete: {
                TableName: TABLE_NAME,
                Key: {
                  PK: `LIST#${listId}`,
                  SK: `TASK#${id}`,
                },
              },
            },
            {
              Put: {
                TableName: TABLE_NAME,
                Item: {
                  PK: `LIST#${listId}`,
                  SK: `TASK#active#${id}`,
                  ...task,
                },
              },
            },
          ],
        };
        try {
          return await dynamoClient.transactWrite(params).promise();
        } catch (error) {
          if (
            isAWSError(error) &&
            error.code === "ConditionalCheckFailedException"
          ) {
            error.message = `Task ${id} of list ${listId} was not found`;
          }
          throw error;
        }
      }
      throw error;
    }
  }
};

export const deleteTask = async (
  taskId: string,
  listId: string
): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> => {
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };
  if (!taskId) throw { message: "Task ID is required" };
  if (!listId) throw { message: "List ID is required" };

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `LIST#${listId}`,
      SK: `TASK#active#${taskId}`,
    },
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    return await dynamoClient.delete(params).promise();
  } catch (error) {
    if (isAWSError(error) && error.code === "ConditionalCheckFailedException") {
      params.Key.SK = `TASK#${taskId}`;
      try {
        await dynamoClient.delete(params).promise();
      } catch (error) {
        if (
          isAWSError(error) &&
          error.code === "ConditionalCheckFailedException"
        ) {
          error.message = `Task ${taskId} of list ${listId} was not found`;
        }
        throw error;
      }
    }
    throw error;
  }
};
