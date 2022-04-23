import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const loginEvent = {
  ...baseAPIGatewayProxyEvent,
  body: JSON.stringify({
    id: "testUserId",
    password: "secret-password",
  }),
};
