import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequest } from "./model";
import { Task } from "@libs/task";
import { genericErrorHandler } from "@libs/generic/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const request = {
      pathParameters: event.pathParameters,
      body: event.body ? JSON.parse(event.body) : null,
    };

    if (!validateRequest(request)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Bad request",
          errors: validateRequest.errors,
        }),
      };
    }

    const listId = request.pathParameters.listId;
    const { id, name, isCompleted, dueDate, desc } = request.body;

    const task = new Task(listId, name, isCompleted, dueDate, desc, id);

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
      `An error occurred while updating the task. Please try again later.`
    );
  }
};
