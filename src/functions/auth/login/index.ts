import { User } from "/opt/nodejs/user.model";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }
  const body = JSON.parse(event.body);
  const { id, password } = body;

  if (!id || !password) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }

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
