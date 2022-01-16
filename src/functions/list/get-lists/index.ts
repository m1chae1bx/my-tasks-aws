import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { List } from "/opt/nodejs/list.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters || !event.pathParameters.userId) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }
  const userId = event.pathParameters.userId;

  try {
    const response = await List.getAll(userId);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while getting the lists of user ${userId}`
    );
  }
};
