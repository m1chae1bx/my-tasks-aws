import { JSONSchemaType, ajv } from "@libs/generic/util";

export interface GetUserRequest {
  pathParameters: {
    userId: string;
  };
}

export const getUserRequestSchema: JSONSchemaType<GetUserRequest> = {
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
  },
  required: ["pathParameters"],
};

export const validateRequest = ajv.compile(getUserRequestSchema);
