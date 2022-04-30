import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const getUserEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    userId: "testUserId",
  },
};
