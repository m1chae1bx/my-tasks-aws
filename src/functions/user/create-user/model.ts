import { JSONSchemaType, ajv } from "/opt/nodejs/util";

export interface CreateUserRequest {
  body: {
    id: string;
    email: string;
    password: string;
    fullName: string;
    nickname: string;
  };
}

export const createUserRequestSchema: JSONSchemaType<CreateUserRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        id: {
          type: "string",
          maxLength: 100,
        },
        email: {
          type: "string",
        },
        password: {
          type: "string",
        },
        fullName: {
          type: "string",
        },
        nickname: {
          type: "string",
          maxLength: 100,
        },
      },
      required: ["id", "email", "password", "fullName", "nickname"],
    },
  },
  required: ["body"],
};

export const validateRequest = ajv.compile(createUserRequestSchema);
