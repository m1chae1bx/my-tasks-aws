import { JSONSchemaType, ajv } from "@libs/generic/util";

export interface UpdateTaskRequest {
  pathParameters: {
    listId: string;
    taskId: string;
  };
  body: {
    id: string;
    name: string;
    isCompleted?: boolean;
    desc?: string;
    dueDate?: string;
  };
}

export const updateTaskRequestSchema: JSONSchemaType<UpdateTaskRequest> = {
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
    body: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
          maxLength: 200,
        },
        isCompleted: {
          type: "boolean",
          nullable: true,
        },
        desc: {
          type: "string",
          nullable: true,
          maxLength: 400,
        },
        dueDate: {
          type: "string",
          nullable: true,
          format: "date-time",
        },
      },
      required: ["id", "name"],
    },
  },
  required: ["pathParameters", "body"],
  if: {
    properties: {
      pathParameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
          },
        },
      },
    },
  },
  then: {
    properties: {
      body: {
        type: "object",
        properties: {
          id: {
            const: { $data: "/pathParameters/taskId" },
          },
        },
      },
    },
  },
};

export const validateRequest = ajv.compile(updateTaskRequestSchema);
