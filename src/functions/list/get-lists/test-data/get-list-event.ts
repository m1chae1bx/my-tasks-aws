import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const getListEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    userId: "testUserId",
  },
};
