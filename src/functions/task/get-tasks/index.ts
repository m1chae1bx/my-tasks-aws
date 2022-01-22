import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Task } from "/opt/nodejs/task.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const query = event.queryStringParameters;
  const listId = event.pathParameters?.listId;
  if (!listId) {
    return {
      statusCode: 400,
      body: "List ID is required",
    };
  }

  try {
    const tasks = await Task.getAll(listId, query);
    return {
      statusCode: 200,
      body: JSON.stringify(tasks),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while getting the tasks of list ${listId}`
    );
  }
};
