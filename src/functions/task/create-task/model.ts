import { JSONSchemaType, ajv } from "@libs/generic/util";

export interface CreateTaskRequest {
  pathParameters: {
    listId: string;
  };
  body: {
    name: string;
    desc?: string;
    dueDate?: string;
  };
}

export const createTaskRequestSchema: JSONSchemaType<CreateTaskRequest> = {
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
    body: {
      type: "object",
      properties: {
        name: {
          type: "string",
          maxLength: 200,
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
      required: ["name"],
    },
  },
  required: ["pathParameters", "body"],
};

export const validateRequest = ajv.compile(createTaskRequestSchema);
