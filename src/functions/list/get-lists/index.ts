import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequest } from "./model";
import { List } from "/opt/nodejs/list.model";
import { genericErrorHandler } from "/opt/nodejs/util";

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
          message: "Bad Request",
          errors: validateRequest.errors,
        }),
      };
    }
    const userId = request.pathParameters.userId;

    const response = await List.getAll(userId);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while getting the task lists. Please try again later.`
    );
  }
};
