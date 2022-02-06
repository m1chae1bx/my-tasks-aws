import { JSONSchemaType, ajv } from "/opt/nodejs/util";

export interface DeleteTaskRequest {
  pathParameters: {
    listId: string;
    taskId: string;
  };
}

export const deleteTaskRequestSchema: JSONSchemaType<DeleteTaskRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        listId: {
          type: "string",
        },
        taskId: {
          type: "string",
        },
      },
      required: ["listId", "taskId"],
    },
  },
  required: ["pathParameters"],
};

export const validateRequest = ajv.compile(deleteTaskRequestSchema);
