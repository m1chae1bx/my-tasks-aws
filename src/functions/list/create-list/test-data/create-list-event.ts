import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const createListEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    userId: "testUserId",
  },
  body: JSON.stringify({
    name: "testListName",
    isDefault: false,
  }),
};
