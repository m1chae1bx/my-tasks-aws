import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const deleteUserEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    userId: "testUserId",
  },
  body: JSON.stringify({
    password: "secret-password",
  }),
};
