import { isAWSError, uuid } from "/opt/nodejs/util";
import { dynamoClient, getTableName } from "/opt/nodejs/dynamo.config";
import { ListDetails } from "./list.model";
import {
  IdAlreadyExistsError,
  ListNotFoundError,
} from "../generic-layer/errors";

export const create = async (list: ListDetails): Promise<string> => {
  const tableName = getTableName();
  const id = uuid();

  if (list.isDefault) {
    return createDefaultList(id, list, tableName);
  } else {
    return createList(id, list, tableName);
  }
};

const createDefaultList = async (
  id: string,
  list: ListDetails,
  tableName: string
): Promise<string> => {
  const { name, userId } = list;
  const params = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
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
          TableName: tableName,
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

  try {
    await dynamoClient.transactWrite(params).promise();
    return id;
  } catch (error) {
    if (isAWSError(error) && error.code === "ConditionalCheckFailedException") {
      console.error(error);
      throw new IdAlreadyExistsError("List");
    }
    throw error;
  }
};

const createList = async (
  id: string,
  list: ListDetails,
  tableName: string
): Promise<string> => {
  const { name, userId } = list;
  const params = {
    TableName: tableName,
    Item: {
      PK: `USER#${userId}`,
      SK: `LIST#${id}`,
      id: id,
      name: name,
    },
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await dynamoClient.put(params).promise();
    return id;
  } catch (error) {
    if (isAWSError(error) && error.code === "ConditionalCheckFailedException") {
      console.error(error);
      throw new IdAlreadyExistsError("List");
    }
    throw error;
  }
};

export const deleteList = async (
  listId: string,
  userId: string
): Promise<void> => {
  const tableName = getTableName();

  const params = {
    TableName: tableName,
    Key: {
      PK: `USER#${userId}`,
      SK: `LIST#${listId}`,
    },
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await dynamoClient.delete(params).promise();
  } catch (error) {
    if (isAWSError(error) && error.code === "ConditionalCheckFailedException") {
      console.error(error);
      throw new ListNotFoundError(listId);
    }
    throw error;
  }
};

export const getAll = async (userId: string): Promise<ListDetails[]> => {
  const tableName = getTableName();

  const params = {
    TableName: tableName,
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

  const data = await dynamoClient.query(params).promise();
  if (data.Items) {
    return data.Items.map((item) => {
      console.log(item);
      const list: ListDetails = {
        id: item.id,
        name: item.name,
        userId: item.userId,
        isDefault: item.isDefault,
      };
      return list;
    });
  }
  return [];
};
