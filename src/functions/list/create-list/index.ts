import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequest } from "./model";
import { List } from "@libs/list";
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
    const { name, isDefault } = request.body;

    const list = new List(name, userId, isDefault);
    const id = await list.save();
    const response = { message: `List ${name} was created successfully`, id };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while creating the list. Please try again later.`
    );
  }
};
