import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User } from "/opt/nodejs/user.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO improve server side validation
  const userId = event.pathParameters?.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Bad Request", // TODO: create a message property
    };
  }

  const body = JSON.parse(event.body);
  const { email, fullName, nickname } = body;
  const userPartial: Partial<User> = {
    id: userId,
    email,
    fullName,
    nickname,
  };

  try {
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
      `An error occurred while patching user ${userId}`
    );
  }
};
