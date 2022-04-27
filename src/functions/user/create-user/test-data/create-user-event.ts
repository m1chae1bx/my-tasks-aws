import { baseAPIGatewayProxyEvent } from "@test-utils/base-objects";
import { UserDetails } from "/opt/nodejs/user.model";

export const createUserEvent = {
  ...baseAPIGatewayProxyEvent,
  body: JSON.stringify({
    fullName: "Full Name",
    nickname: "Nickname",
    id: "testUserId",
    email: "test@email.com",
    password: "pass1234%",
  }),
};

export const validationErrors = [
  {
    instancePath: "/body/password",
    schemaPath: "#/properties/body/properties/password/minLength",
    keyword: "minLength",
    params: {
      limit: 8,
    },
    message: "must NOT have fewer than 8 characters",
  },
  {
    instancePath: "/body/password",
    schemaPath: "#/properties/body/properties/password/pattern",
    keyword: "pattern",
    params: {
      pattern:
        "^(?=[^A-Za-z]*[A-Za-z])(?=[^0-9]*[0-9])(?=[^@#$%&!_:\\-.]*[@#$%&!_:\\-.]).*",
    },
    message:
      'must match pattern "^(?=[^A-Za-z]*[A-Za-z])(?=[^0-9]*[0-9])(?=[^@#$%&!_:\\-.]*[@#$%&!_:\\-.]).*"',
  },
];

export const testUser: UserDetails = {
  id: "testUserId",
  email: "test@email.com",
  fullName: "Full Name",
  nickname: "Nickname",
  salt: "salt",
  hash: "hash",
};
