import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequest } from "./model";
import {
  EmailUnavailableError,
  UsernameUnavailableError,
} from "@libs/generic/errors";
import { User } from "@libs/user";
import { genericErrorHandler } from "@libs/generic/util";

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
        body: JSON.stringify(new EmailUnavailableError()),
      };
    } else {
      const userByUsername = await User.get(id);
      if (userByUsername) {
        return {
          statusCode: 409,
          body: JSON.stringify(new UsernameUnavailableError()),
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
    if (error instanceof UsernameUnavailableError) {
      return {
        statusCode: 409,
        body: JSON.stringify(error),
      };
    }

    return genericErrorHandler(
      error,
      `An error occurred while creating the user. Please try again later.`
    );
  }
};
