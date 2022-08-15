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
      queryStringParameters: event.queryStringParameters,
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

    const { listId } = request.pathParameters;
    const tasks = await Task.getAll(listId, request.queryStringParameters);
    return {
      statusCode: 200,
      body: JSON.stringify(tasks),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      "An error occurred while getting the tasks. Please try again later."
    );
  }
};
