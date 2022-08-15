import { UserDetails, UserPreferences } from "../user.model";

const userPreferences: UserPreferences = {
  defaultListId: "test-default-list-id",
};

export const testUserInit: UserDetails = {
  id: "testUserId",
  email: "test@email.com",
  fullName: "Full Name",
  nickname: "Nickname",
  hash: "test-hash",
  salt: "test-salt",
  preferences: userPreferences,
};
