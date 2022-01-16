import { User } from "/opt/nodejs/user.model";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }

  try {
    const user = await User.get(userId);
    if (user) {
      delete user.hash;
      delete user.salt;
      return {
        statusCode: 200,
        body: JSON.stringify({ user }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `User ${userId} was not found` }),
      };
    }
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while getting user ${userId}`
    );
  }
};
