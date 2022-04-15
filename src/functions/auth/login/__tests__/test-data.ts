import { TestEventFactory } from "@test-utils/base-objects";

export const loginEvent = TestEventFactory.createAPIEvent()
  .body({
    id: "testUserId",
    password: "secret-password",
  })
  .generate();
