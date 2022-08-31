import { DueDate, GetTasksQuery } from "@libs/task";
import { JSONSchemaType, ajv } from "@libs/generic/util";

export interface GetTasksRequest {
  pathParameters: {
    listId: string;
  };
  queryStringParameters?: GetTasksQuery;
}

export const getTasksRequestSchema: JSONSchemaType<GetTasksRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        listId: {
          type: "string",
        },
      },
      required: ["listId"],
    },
    queryStringParameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          nullable: true,
        },
        dueDate: {
          type: "string",
          enum: Object.values(DueDate),
          nullable: true,
        },
        today: {
          type: "string",
          nullable: true,
          format: "date-time",
        },
        includeCompleted: {
          type: "string",
          enum: ["true"],
          nullable: true,
        },
      },
      nullable: true,
      if: {
        properties: {
          dueDate: {
            enum: Object.values(DueDate),
          },
        },
        required: ["dueDate"],
      },
      then: { required: ["today"] },
    },
  },
  required: ["pathParameters"],
};

export const validateRequest = ajv.compile(getTasksRequestSchema);
