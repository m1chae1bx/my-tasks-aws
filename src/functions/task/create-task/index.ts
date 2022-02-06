import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createTaskRequestSchema } from "./model";
import { Task } from "/opt/nodejs/task.model";
import { genericErrorHandler, ajv } from "/opt/nodejs/util";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const request = {
      pathParameters: event.pathParameters,
      body: event.body ? JSON.parse(event.body) : {},
    };

    const validate = ajv.compile(createTaskRequestSchema);
    if (!validate(request)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: validate.errors,
        }),
      };
    }

    const { name, dueDate, desc } = request.body;
    const { listId } = request.pathParameters;
    const task = new Task(
      listId,
      name,
      false,
      dueDate ? new Date(dueDate) : undefined,
      desc
    );

    const id = await task.save();
    const response = { message: `Task '${name}' was created successfully`, id };
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return genericErrorHandler(
      error,
      "An error occurred while creating the task. Please try again later."
    );
  }
};
