import { APIGatewayProxyResult } from "aws-lambda";
import { genericErrorHandler, isAWSError } from "../util";

jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("test-uuid"),
}));

describe("genericErrorHandler - without optional params", () => {
  let result: APIGatewayProxyResult;

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(jest.fn());
    const error = new Error("error");
    const message = "test message";
    result = genericErrorHandler(error, message);
  });

  it("should call console.error", () => {
    expect(jest.spyOn(console, "error").mock.calls).toMatchSnapshot();
  });

  it("should return a result", () => {
    expect(result).toMatchSnapshot();
  });

  afterAll(() => jest.clearAllMocks());
});

describe("genericErrorHandler - with optional params", () => {
  let result: APIGatewayProxyResult;

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(jest.fn());
    const error = new Error("error");
    const message = "test message";
    const code = "test code";
    const context = "test context";
    result = genericErrorHandler(error, message, code, context);
  });

  it("should call console.error", () => {
    expect(jest.spyOn(console, "error").mock.calls).toMatchSnapshot();
  });

  it("should return a result", () => {
    expect(result).toMatchSnapshot();
  });

  afterAll(() => jest.clearAllMocks());
});

describe("isAWSError - input is AWSError", () => {
  it("should return true", () => {
    expect(isAWSError({ code: "test-code" })).toBe(true);
  });
});

describe("isAWSError - input is not AWSError", () => {
  it("should return false", () => {
    expect(isAWSError({ notCode: "test-not-code" })).toBe(false);
  });
});
