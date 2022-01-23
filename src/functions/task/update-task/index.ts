import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Task } from "/opt/nodejs/task.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }
  const listId = event.pathParameters?.listId;
  const queryId = event.pathParameters?.taskId;
  const { id, name, isCompleted, dueDate, desc } = JSON.parse(event.body);

  if (!listId) {
    const response = {
      message: "List ID is required",
    };
    return {
      statusCode: 400,
      body: JSON.stringify(response),
    };
  }
  if (queryId !== id) {
    const response = {
      message: "Task ID in parameters and body must match",
      code: "idsNotMatching",
    };
    return {
      statusCode: 400,
      body: JSON.stringify(response),
    };
  }

  if (!name) {
    const response = {
      message: "Name is required",
      code: "missingField",
    };
    return {
      statusCode: 400,
      body: JSON.stringify(response),
    };
  }

  const task = new Task(listId, name, isCompleted, dueDate, desc, id);

  try {
    await task.update();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Task '${name}' was updated successfully`,
      }),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while updating the task ${task.id}`
    );
  }
};
