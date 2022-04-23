import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import jwt, { JwtPayload } from "jsonwebtoken";

type UserDetailsPayload = JwtPayload & {
  id: string;
  email: string;
};

const isUserDetailsPayload = (
  decoded: unknown
): decoded is UserDetailsPayload => "id" in (decoded as UserDetailsPayload);

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const { AWS_REGION, ACCOUNT_ID } = process.env;
  const response: APIGatewayAuthorizerResult = {
    principalId: "",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Deny",
          Resource: `arn:aws:execute-api:${AWS_REGION}:${ACCOUNT_ID}:*`,
        },
      ],
    },
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error(
      `JWT_SECRET environment variable is not set in Lambda function ${process.env.AWS_LAMBDA_FUNCTION_NAME}`
    );
  }

  const token = event.authorizationToken.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, jwtSecret);
    if (isUserDetailsPayload(decodedToken)) {
      response.principalId = decodedToken.id;
      response.context = {
        email: decodedToken.email,
      };
    }
    response.policyDocument.Statement[0].Effect = "Allow";
  } catch (error) {
    console.error("Error verifying token", error);
  }

  return response;
};
