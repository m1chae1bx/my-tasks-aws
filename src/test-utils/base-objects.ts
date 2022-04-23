import {
  APIGatewayProxyEvent,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

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
