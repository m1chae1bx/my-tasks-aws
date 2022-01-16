import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User } from "/opt/nodejs/user.model";
import { genericErrorHandler, isAWSError } from "/opt/nodejs/util";

const emailUnavailableResponse = {
  message: "Email address is already registered",
  code: "emailUnavailable",
};

const usernameUnavailableResponse = {
  message: "Username is already taken",
  code: "usernameUnavailable",
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO move validation to json schema validation
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Bad Request", // TODO: create a message property
    };
  }

  const body = JSON.parse(event.body);
  const { id, email, password, fullName, nickname } = body;

  try {
    const userByEmail = await User.getByEmail(email);
    if (userByEmail) {
      return {
        statusCode: 409,
        body: JSON.stringify(emailUnavailableResponse),
      };
    } else {
      const userByUsername = await User.get(id);
      if (userByUsername) {
        return {
          // TODO create a Response object or use existing AWS if any?
          statusCode: 409,
          body: JSON.stringify(usernameUnavailableResponse),
        };
      } else {
        const newUser = new User(id, email, fullName, nickname);
        newUser.setPassword(password);
        await newUser.save();

        const response = {
          message: `User ${id} was created successfully`,
          id: id,
        };
        return {
          statusCode: 200,
          body: JSON.stringify(response),
        };
      }
    }
  } catch (error) {
    if (isAWSError(error) && error.code === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        body: JSON.stringify(emailUnavailableResponse),
      };
    }

    return genericErrorHandler(
      error,
      `An error occurred while creating user ${id}`
    );
  }
};
