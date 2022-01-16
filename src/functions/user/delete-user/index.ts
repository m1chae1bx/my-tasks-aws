import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User } from "/opt/nodejs/user.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body || !event.pathParameters) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }

  const userId = event.pathParameters.userId;
  const body = JSON.parse(event.body);
  const { password } = body;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Username is required",
        code: "missingField",
      }),
    };
  }

  if (!password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Password is required",
        code: "missingField",
      }),
    };
  }

  try {
    const user = await User.get(userId);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found",
          code: "notFound",
        }),
      };
    }

    if (!user.validatePassword(password)) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Incorrect password",
          code: "incorrectPassword",
        }),
      };
    }

    await user.delete();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User ${userId} was deleted successfully`,
        code: "userDeleted",
      }),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while deleting user ${userId}`,
      "deleteUserError"
    );
  }
};
