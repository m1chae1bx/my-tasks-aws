import { JSONSchemaType, ajv } from "@libs/generic/util";

export interface LoginRequest {
  body: {
    id: string;
    password: string;
  };
}

export const loginRequestSchema: JSONSchemaType<LoginRequest> = {
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
        password: {
          type: "string",
        },
      },
      required: ["id", "password"],
    },
  },
  required: ["body"],
};

export const validateRequest = ajv.compile(loginRequestSchema);
