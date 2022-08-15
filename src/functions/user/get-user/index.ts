import { User } from "@libs/user";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { genericErrorHandler } from "@libs/generic/util";
import { validateRequest } from "./model";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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

  const userId = request.pathParameters.userId;

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
