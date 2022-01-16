import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { List } from "/opt/nodejs/list.model";
import { genericErrorHandler } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: "User ID is required",
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }

  const { name, isDefault } = JSON.parse(event.body);

  if (!name) {
    const response = {
      message: "Name is required",
      code: "missingField",
    };
    return {
      statusCode: 400,
      body: JSON.stringify(response),
    };
  }

  const list = new List(name, userId, isDefault);
  try {
    const id = await list.save();
    const response = { message: `List ${id} was created successfully`, id };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      `An error occurred while creating the list ${name}`
    );
  }
};
