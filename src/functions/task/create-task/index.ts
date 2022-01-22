import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Task } from "/opt/nodejs/task.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const listId = event.pathParameters?.listId;
  if (!listId) {
    return {
      statusCode: 400,
      body: "List ID is required",
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }
  const { name, dueDate, desc } = JSON.parse(event.body);
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

  const task = new Task(listId, name, false, dueDate, desc);

  try {
    const id = await task.save();
    const response = { message: `Task '${name}' was created successfully`, id };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while creating the task ${name}`
    );
  }
};
