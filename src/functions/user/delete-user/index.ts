import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequest } from "./model";
import { User } from "/opt/nodejs/user.model";
import { genericErrorHandler } from "/opt/nodejs/util";

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

    const userId = request.pathParameters.userId;
    const password = request.body.password;

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
      "An error occurred while deleting the user. Please try again later.",
      "deleteUserError"
    );
  }
};
