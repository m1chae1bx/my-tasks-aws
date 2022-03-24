import { JSONSchemaType, ajv } from "/opt/nodejs/util";

export interface DeleteListRequest {
  pathParameters: {
    userId: string;
    listId: string;
  };
}

export const deleteListRequestSchema: JSONSchemaType<DeleteListRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
        },
        listId: {
          type: "string",
        },
      },
      required: ["userId", "listId"],
    },
  },
  required: ["pathParameters"],
};

export const validateRequest = ajv.compile(deleteListRequestSchema);
