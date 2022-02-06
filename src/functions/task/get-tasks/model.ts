import { GetTasksQuery } from "/opt/nodejs/task.model";
import { JSONSchemaType, ajv } from "/opt/nodejs/util";

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
          enum: ["today", "tomorrow", "upcoming", "overdue", "unplanned"],
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
      if: { properties: { dueDate: { type: "string" } } },
      then: { required: ["today"] },
    },
  },
  required: ["pathParameters"],
};

export const validateRequest = ajv.compile(getTasksRequestSchema);
