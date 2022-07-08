import { User } from "/opt/nodejs/user.model";

export const testUser: Partial<User> = {
  fullName: "Full Name",
  nickname: "Nickname",
  id: "testUserId",
  email: "test@email.com",
  hash: "test-hash",
  salt: "test-salt",
};
