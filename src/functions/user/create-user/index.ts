import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequest } from "./model";
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
  try {
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

    const { id, email, password, fullName, nickname } = request.body;

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
      `An error occurred while creating the user. Please try again later.`
    );
  }
};
