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

    const { name, dueDate, desc } = request.body;
    const { listId } = request.pathParameters;
    const task = new Task(listId, name, false, dueDate, desc);

    const id = await task.save();
    const response = { message: `Task '${name}' was created successfully`, id };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      "An error occurred while creating the task. Please try again later."
    );
  }
};
