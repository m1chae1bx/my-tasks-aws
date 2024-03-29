import { JSONSchemaType, ajv } from "@libs/generic/util";

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
          description:
            "Must contain at least one letter, one number, and one special character, and must be between 8-20 characters long",
          minLength: 8,
          maxLength: 20,
          pattern:
            "^(?=[^A-Za-z]*[A-Za-z])(?=[^0-9]*[0-9])(?=[^@#$%&!_:\\-.]*[@#$%&!_:\\-.]).*",
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
