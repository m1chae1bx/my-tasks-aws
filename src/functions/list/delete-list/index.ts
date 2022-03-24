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
          message: "Bad request",
          errors: validateRequest.errors,
        }),
      };
    }
    const { userId, listId } = request.pathParameters;

    await List.delete(listId, userId);
    const response = {
      message: `List ${listId} was deleted successfully`,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while deleting the list. Please try again later.`
    );
  }
};
