import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import {
  EnvironmentConfigError,
  IdAlreadyExistsError,
  RequiredPropertyMissingError,
  TaskNotFoundError,
} from "../generic-layer/errors";
import { DueDate, GetTasksQuery, TaskDetails } from "./task.model";
import { dynamoClient, TABLE_NAME } from "/opt/nodejs/dynamo.config";
import { isAWSError, uuid } from "/opt/nodejs/util";

export const create = async (task: TaskDetails): Promise<string> => {
  if (!TABLE_NAME) throw new EnvironmentConfigError("TABLE_NAME");

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
      console.error(error);
      throw new IdAlreadyExistsError("Task");
    }
    throw error;
  }
};

export const getAll = async (
  listId: string,
  query: GetTasksQuery
): Promise<TaskDetails[]> => {
  if (!TABLE_NAME) throw new EnvironmentConfigError("TABLE_NAME");

  const filterExpressionList = [];
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
    ":SK": query.includeCompleted ? `TASK#` : `TASK#active#`,
  };
  if (query.name) {
    filterExpressionList.push("contains(nameSearch, :name)");
    expressionAttributeValues[":name"] = query.name.toLowerCase();
  }
  if (query.dueDate && query.today) {
    const date = new Date(query.today);
    const dueDate = query.dueDate;
    switch (dueDate) {
      case DueDate.TODAY:
        filterExpressionList.push("dueDate = :dueDate");
        expressionAttributeValues[":dueDate"] = date.toISOString();
        break;
      case DueDate.TOMORROW:
        date.setDate(date.getDate() + 1);
        filterExpressionList.push("dueDate = :dueDate");
        expressionAttributeValues[":dueDate"] = date.toISOString();
        break;
      case DueDate.UPCOMING:
        date.setDate(date.getDate() + 1);
        filterExpressionList.push("dueDate > :dueDate");
        expressionAttributeValues[":dueDate"] = date.toISOString();
        break;
      case DueDate.OVERDUE:
        filterExpressionList.push("dueDate < :dueDate");
        expressionAttributeValues[":dueDate"] = date.toISOString();
        break;
      case DueDate.UNPLANNED:
        filterExpressionList.push("attribute_not_exists(dueDate)");
        break;
    }
  }

  const params: DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :PK and begins_with(#SK, :SK)",
    ProjectionExpression: "id, #name, #desc, isCompleted, dueDate",
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (filterExpressionList.length > 0) {
    params.FilterExpression = filterExpressionList.join(" and ");
  }

  const data = await dynamoClient.query(params).promise();
  if (data.Items) {
    return data.Items.map((item) => {
      const task: TaskDetails = {
        id: item.id,
        name: item.name,
        desc: item.desc,
        isCompleted: item.isCompleted,
        dueDate: item.dueDate,
        listId: listId,
      };
      return task;
    });
  }
  return [];
};

export const update = async (task: TaskDetails): Promise<void> => {
  if (!TABLE_NAME) throw new EnvironmentConfigError("TABLE_NAME");
  if (!task.id) throw new RequiredPropertyMissingError("id");

  const id = task.id;
  const listId = task.listId;

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

    await dynamoClient.transactWrite(params).promise();
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
      await dynamoClient.put(params).promise();
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
          await dynamoClient.transactWrite(params).promise();
        } catch (error) {
          if (
            isAWSError(error) &&
            error.code === "ConditionalCheckFailedException"
          ) {
            console.error(error);
            throw new TaskNotFoundError(id);
          }
          throw error;
        }
      } else {
        throw error;
      }
    }
  }
};

export const deleteTask = async (
  taskId: string,
  listId: string
): Promise<void> => {
  if (!TABLE_NAME) throw new EnvironmentConfigError("TABLE_NAME");

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `LIST#${listId}`,
      SK: `TASK#active#${taskId}`,
    },
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await dynamoClient.delete(params).promise();
  } catch (error) {
    if (
      !isAWSError(error) ||
      error.code !== "ConditionalCheckFailedException"
    ) {
      throw error;
    }

    params.Key.SK = `TASK#${taskId}`;
    try {
      await dynamoClient.delete(params).promise();
    } catch (error) {
      if (
        isAWSError(error) &&
        error.code === "ConditionalCheckFailedException"
      ) {
        console.error(error);
        throw new TaskNotFoundError(taskId);
      }
      throw error;
    }
  }
};
