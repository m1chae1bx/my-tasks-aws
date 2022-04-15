import { APIGatewayProxyEvent } from "aws-lambda";

const baseEvent: APIGatewayProxyEvent = {
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

export class TestEventFactory {
  static createAPIEvent(): TestEvent {
    return new TestEvent(baseEvent);
  }
}

class TestEvent {
  _event: APIGatewayProxyEvent;
  constructor(event: APIGatewayProxyEvent) {
    this._event = event;
  }

  body(obj: { [key: string]: string }): TestEvent {
    this._event.body = JSON.stringify(obj);
    return this;
  }

  merge(obj: { [key: string]: string }): TestEvent {
    this._event = { ...this._event, ...obj };
    return this;
  }

  generate(): APIGatewayProxyEvent {
    return this._event;
  }
}

export const ajvError = [
  {
    keyword: "",
    instancePath: "",
    schemaPath: "",
    params: {},
    message: "test error",
  },
];
