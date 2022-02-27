import { User } from "/opt/nodejs/user.model";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { genericErrorHandler } from "/opt/nodejs/util";
import { validateRequest } from "./model";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const request = {
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

  const { id, password } = request.body;

  try {
    const user = await User.get(id);
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: `User ${id} was not found` }),
      };
    }
    if (!user.validatePassword(password)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Password is incorrect" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ token: user.generateJwt() }),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while logging in user ${id}`
    );
  }
};
