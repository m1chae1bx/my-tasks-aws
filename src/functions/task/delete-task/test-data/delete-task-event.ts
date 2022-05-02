import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const deleteTaskEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    listId: "test-list-id",
    taskId: "test-task-id",
  },
};
