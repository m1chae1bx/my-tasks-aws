import { validateRequest } from "../model";

describe("validateRequest", () => {
  it("should return true when all params are valid", () => {
    const request = {
      pathParameters: {
        listId: "test-list-id",
      },
      queryStringParameters: {
        name: "test-name",
        dueDate: "today",
        today: "2020-01-01T00:00:00.000Z",
        includeCompleted: "true",
      },
    };
    expect(validateRequest(request)).toBe(true);
  });

  it("should return true when including completed tasks", () => {
    const request = {
      pathParameters: {
        listId: "test-list-id",
      },
      queryStringParameters: {
        includeCompleted: "true",
      },
    };
    expect(validateRequest(request)).toBe(true);
  });

  it("should return true when no query params are provided", () => {
    const request = {
      pathParameters: {
        listId: "test-list-id",
      },
      queryStringParameters: null,
    };
    expect(validateRequest(request)).toBe(true);
  });

  it("should return true when querying by name only", () => {
    const request = {
      pathParameters: {
        listId: "test-list-id",
      },
      queryStringParameters: {
        name: "test-name",
      },
    };
    expect(validateRequest(request)).toBe(true);
  });

  it("should return false when today is not provided with dueDate", () => {
    const request = {
      pathParameters: {
        listId: "test-list-id",
      },
      queryStringParameters: {
        dueDate: "today",
      },
    };
    expect(validateRequest(request)).toBe(false);
  });
});
