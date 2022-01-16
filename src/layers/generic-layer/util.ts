import { APIGatewayProxyResult } from "aws-lambda";
import { AWSError } from "aws-sdk";

export { v4 as uuid } from "uuid";

export const isAWSError = (error: unknown): error is AWSError => {
  return (error as AWSError).code !== undefined;
};

export const genericErrorHandler = (
  error: unknown,
  message: string,
  code?: string
): APIGatewayProxyResult => {
  console.error(error);
  return {
    statusCode: 500,
    body: JSON.stringify({
      message,
      code,
    }),
  };
};
