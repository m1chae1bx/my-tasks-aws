import { ListDetails } from "../list.model";

export const testList: ListDetails = {
  id: "test-list-id",
  name: "Test list 1",
  userId: "test-user-id",
  isDefault: true,
};

export const testLists: ListDetails[] = [
  {
    id: "test-list-id-1",
    name: "Test list 1",
    userId: "test-user-id",
    isDefault: true,
  },
  {
    id: "test-list-id-2",
    name: "Test list 2",
    userId: "test-user-id",
    isDefault: false,
  },
];
