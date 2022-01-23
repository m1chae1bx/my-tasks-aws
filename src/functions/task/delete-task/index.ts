import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Task } from "/opt/nodejs/task.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const taskId = event.pathParameters?.taskId;
  const listId = event.pathParameters?.listId;
  if (!taskId || !listId) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }

  try {
    await Task.delete(taskId, listId);
    const response = { message: `Task ${taskId} was deleted successfully` };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while deleting task ${taskId}`
    );
  }
};
