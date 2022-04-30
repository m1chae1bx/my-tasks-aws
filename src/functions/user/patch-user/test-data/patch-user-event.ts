import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";

export const patchUserEvent = {
  ...baseAPIGatewayProxyEvent,
  pathParameters: {
    userId: "testUserId",
  },
  body: JSON.stringify({
    userId: "testUserId",
    email: "test@email.com",
    fullName: "Full Name",
    nickname: "Nickname",
  }),
};
