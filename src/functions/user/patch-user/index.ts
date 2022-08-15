import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequest } from "./model";
import { User } from "@libs/user";
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

    const userId = request.pathParameters.userId;
    const { email, fullName, nickname } = request.body;
    const userPartial: Partial<User> = {
      id: userId,
      email,
      fullName,
      nickname,
    };

    await User.patch(userPartial);
    const response = {
      message: `User ${userId} was patched successfully`,
      id: userId,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while patching the user. Please try again later.`
    );
  }
};
