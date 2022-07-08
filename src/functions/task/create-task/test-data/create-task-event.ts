import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const createTaskEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    listId: "test-list-id",
  },
  body: JSON.stringify({
    name: "test-task-name",
    desc: "test-task-desc",
    dueDate: "2020-01-01T00:00:00.000Z",
  }),
};
