import { JSONSchemaType, ajv } from "/opt/nodejs/util";

export interface DeleteUserRequest {
  pathParameters: {
    userId: string;
  };
  body: {
    password: string;
  };
}

export const deleteUserRequestSchema: JSONSchemaType<DeleteUserRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          maxLength: 100,
        },
      },
      required: ["userId"],
    },
    body: {
      type: "object",
      properties: {
        password: {
          type: "string",
        },
      },
      required: ["password"],
    },
  },
  required: ["pathParameters", "body"],
};

export const validateRequest = ajv.compile(deleteUserRequestSchema);
