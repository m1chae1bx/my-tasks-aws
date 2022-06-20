import {
  APIGatewayProxyEvent,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PromiseResult } from "aws-sdk/lib/request";

export const baseAPIGatewayProxyEvent: APIGatewayProxyEvent = {
  headers: {},
  multiValueHeaders: {},
  httpMethod: "",
  isBase64Encoded: false,
  path: "",
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: "",
    apiId: "",
    authorizer: {},
    protocol: "",
    httpMethod: "",
    path: "",
    stage: "",
    requestId: "",
    resourceId: "",
    resourcePath: "",
    requestTimeEpoch: 0,
    identity: {
      accessKey: "",
      accountId: "",
      apiKey: "",
      apiKeyId: "",
      caller: "",
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: "",
      user: null,
      userAgent: null,
      userArn: null,
    },
  },
  body: null,
  resource: "",
};

export const baseTokenAuthorizerEvent: APIGatewayTokenAuthorizerEvent = {
  authorizationToken: "Bearer test-bearer-token",
  methodArn: "test-method-arn",
  type: "TOKEN",
};

export const ajvError = [
  {
    keyword: "",
    instancePath: "",
    schemaPath: "",
    params: {},
    message: "test error",
  },
];

export const ddbDeleteResult: PromiseResult<
  DocumentClient.DeleteItemOutput,
  AWSError
> = {
  $response: {
    data: {},
    error: undefined,
    hasNextPage: jest.fn(),
    httpResponse: {
      statusCode: 200,
      headers: {},
      statusMessage: "OK",
      body: JSON.stringify({}),
      createUnbufferedStream: jest.fn(),
      streaming: false,
    },
    nextPage: jest.fn(),
    redirectCount: 0,
    requestId: "test-request-id",
    retryCount: 0,
  },
};

export const conditionalCheckFailedException: AWSError = {
  code: "ConditionalCheckFailedException",
  name: "ConditionalCheckFailedException",
  message: "The conditional request failed",
  time: new Date("2022-01-01T00:00:00.000Z"),
};
