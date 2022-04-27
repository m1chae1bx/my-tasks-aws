import { APIGatewayAuthorizerResult } from "aws-lambda";
import { handler } from "../index";
import { authEvent } from "../test-data/auth-event";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("lambda-authorizer", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("happy path", () => {
    let result: APIGatewayAuthorizerResult;

    beforeAll(async () => {
      process.env = {
        AWS_REGION: "test-region",
        ACCOUNT_ID: "test-account-id",
        AWS_LAMBDA_FUNCTION_NAME: "test-lambda-function-name",
        JWT_SECRET: "test-jwt-secret",
      };
      (jwt.verify as jest.Mock).mockReturnValueOnce({
        id: "test-user-id",
        email: "test@email.com",
      });

      result = await handler(authEvent);
    });

    it("should return allow IAM policy", () => {
      expect(result.policyDocument.Statement[0]).toEqual({
        Action: "execute-api:Invoke",
        Effect: "Allow",
        Resource: `arn:aws:execute-api:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:*`,
      });
      expect(result.principalId).toBe("test-user-id");
      expect(result.context?.email).toEqual("test@email.com");
    });
  });

  describe("sad path - no JWT_SECRET", () => {
    let err: unknown;

    beforeAll(async () => {
      process.env = {
        AWS_REGION: "test-region",
        ACCOUNT_ID: "test-account-id",
        AWS_LAMBDA_FUNCTION_NAME: "test-lambda-function-name",
      };
      try {
        await handler(authEvent);
      } catch (error) {
        err = error;
      }
    });

    it("should return an error", () => {
      expect(err).toMatchSnapshot();
    });
  });

  describe("sad path - error verifying token", () => {
    let result: APIGatewayAuthorizerResult;

    beforeAll(async () => {
      jest.spyOn(console, "error").mockClear();
      process.env = {
        AWS_REGION: "test-region",
        ACCOUNT_ID: "test-account-id",
        AWS_LAMBDA_FUNCTION_NAME: "test-lambda-function-name",
        JWT_SECRET: "test-jwt-secret",
      };
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("test-error");
      });
      result = await handler({ ...authEvent, authorizationToken: "invalid" });
    });

    it("should log error", () => {
      expect(jest.spyOn(console, "error").mock.calls).toMatchSnapshot();
    });
    it("should return deny IAM policy", () => {
      expect(result.policyDocument.Statement[0]).toEqual({
        Action: "execute-api:Invoke",
        Effect: "Deny",
        Resource: `arn:aws:execute-api:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:*`,
      });
    });
  });

  describe("sad path - JWT payload is not UserDetailsPayload", () => {
    let result: APIGatewayAuthorizerResult;

    beforeAll(async () => {
      jest.spyOn(console, "warn").mockClear();
      process.env = {
        AWS_REGION: "test-region",
        ACCOUNT_ID: "test-account-id",
        AWS_LAMBDA_FUNCTION_NAME: "test-lambda-function-name",
        JWT_SECRET: "test-jwt-secret",
      };
      (jwt.verify as jest.Mock).mockReturnValueOnce({});
      result = await handler(authEvent);
    });

    it("should log warning", () => {
      expect(jest.spyOn(console, "warn").mock.calls).toMatchSnapshot();
    });

    it("should return allow IAM policy", () => {
      expect(result.policyDocument.Statement[0]).toEqual({
        Action: "execute-api:Invoke",
        Effect: "Allow",
        Resource: `arn:aws:execute-api:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:*`,
      });
    });

    it("should return empty principalId and context", () => {
      expect(result.principalId).toBe("");
      expect(result.context).toBe(undefined);
    });
  });
});
