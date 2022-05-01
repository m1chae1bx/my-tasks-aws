import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const deleteListEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    userId: "testUserId",
    listId: "testListId",
  },
};
