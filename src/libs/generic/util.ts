import { APIGatewayProxyResult } from "aws-lambda";
import { AWSError } from "aws-sdk";
import addFormats from "ajv-formats";

export { v4 as uuid } from "uuid";
import { v4 as uuid } from "uuid";
export { default as Ajv, JSONSchemaType } from "ajv";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true, $data: true });
addFormats(ajv);
export { ajv };

export const isAWSError = (error: unknown): error is AWSError => {
  return (error as AWSError).code !== undefined;
};

export const genericErrorHandler = (
  error: unknown,
  message: string,
  code?: string,
  context?: unknown
): APIGatewayProxyResult => {
  const referenceId = uuid();
  console.error({ error, context, referenceId });
  return {
    statusCode: 500,
    body: JSON.stringify({
      message,
      code,
      referenceId,
    }),
  };
};
