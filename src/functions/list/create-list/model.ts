import { JSONSchemaType, ajv } from "/opt/nodejs/util";

export interface CreateListRequest {
  pathParameters: {
    userId: string;
  };
  body: {
    name: string;
    isDefault?: boolean;
  };
}

export const createListRequestSchema: JSONSchemaType<CreateListRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
        },
      },
      required: ["userId"],
    },
    body: {
      type: "object",
      properties: {
        name: {
          type: "string",
          maxLength: 100,
        },
        isDefault: {
          type: "boolean",
          nullable: true,
        },
      },
      required: ["name"],
    },
  },
  required: ["pathParameters", "body"],
};

export const validateRequest = ajv.compile(createListRequestSchema);
