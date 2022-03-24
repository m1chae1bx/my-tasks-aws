import { JSONSchemaType, ajv } from "/opt/nodejs/util";

export interface GetListsRequest {
  pathParameters: {
    userId: string;
  };
}

export const getListsRequestSchema: JSONSchemaType<GetListsRequest> = {
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
  },
  required: ["pathParameters"],
};

export const validateRequest = ajv.compile(getListsRequestSchema);
