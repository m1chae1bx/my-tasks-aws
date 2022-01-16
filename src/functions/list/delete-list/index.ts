import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { List } from "/opt/nodejs/list.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (
    !event.pathParameters ||
    !event.pathParameters.listId ||
    !event.pathParameters.userId
  ) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }
  const userId = event.pathParameters.userId;
  const listId = event.pathParameters.listId;

  try {
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
      `An error occurred while deleting list ${listId}`
    );
  }
};
