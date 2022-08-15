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

    const { listId, taskId } = request.pathParameters;
    await Task.delete(taskId, listId);

    const response = { message: `Task ${taskId} was deleted successfully` };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while deleting the task. Please try again later.`
    );
  }
};
