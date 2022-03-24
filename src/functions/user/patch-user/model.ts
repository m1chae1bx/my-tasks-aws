import { JSONSchemaType, ajv } from "/opt/nodejs/util";

export interface PatchUserRequest {
  pathParameters: {
    userId: string;
  };
  body: {
    email?: string;
    fullName?: string;
    nickname?: string;
  };
}

export const patchUserRequestSchema: JSONSchemaType<PatchUserRequest> = {
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
        email: {
          type: "string",
          nullable: true,
        },
        fullName: {
          type: "string",
          nullable: true,
        },
        nickname: {
          type: "string",
          maxLength: 100,
          nullable: true,
        },
      },
      additionalProperties: false,
    },
  },
  required: ["pathParameters", "body"],
};

export const validateRequest = ajv.compile(patchUserRequestSchema);
