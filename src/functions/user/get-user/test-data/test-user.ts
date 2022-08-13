import { User } from "@libs/user";

export const testUser: Partial<User> = {
  fullName: "Full Name",
  nickname: "Nickname",
  id: "testUserId",
  email: "test@email.com",
  hash: "test-hash",
  salt: "test-salt",
};
