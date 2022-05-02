import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const getTasksEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    listId: "test-list-id",
  },
  queryStringParameters: {
    name: "test-name",
    dueDate: "2020-01-01",
    includeCompleted: "true",
  },
};
