import { APIGatewayAuthorizerResult } from "aws-lambda";
import { handler } from "../index";
import { authEvent } from "../test-data/auth-event";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("lambda-authorizer", () => {
  describe("happy path", () => {
    let result: APIGatewayAuthorizerResult;

    beforeAll(async () => {
      process.env = {
        AWS_REGION: "test-region",
        ACCOUNT_ID: "test-account-id",
        JWT_SECRET: "test-jwt-secret",
      };
      (jwt.verify as jest.Mock).mockReturnValueOnce({
        id: "test-user-id",
        email: "test@email.com",
      });
      result = await handler(authEvent);
    });

    it("should return correct IAM policy", () => {
      expect(result.policyDocument.Statement[0]).toEqual({
        Action: "execute-api:Invoke",
        Effect: "Allow",
        Resource: `arn:aws:execute-api:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:*`,
      });
      expect(result.principalId).toBe("test-user-id");
      expect(result.context?.email).toEqual("test@email.com");
    });
  });

  // describe("sad path - invalid request", () => {
  //   let result: APIGatewayAuthorizerResult;

  //   beforeAll(async () => {
  //     result = await handler(authEvent);
  //   });

  //   it("should return 400 status code", () => {
  //     expect(result.statusCode).toBe(400);
  //   });

  //   it("should return errors", () => {
  //     expect(result.body).toMatchSnapshot();
  //     expect(result.body).toContain("test error");
  //   });
  // });
});
