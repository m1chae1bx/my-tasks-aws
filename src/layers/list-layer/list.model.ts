import { create, deleteList, getAll } from "./list.dao";

export interface ListDetails {
  id?: string;
  name: string;
  userId: string;
  isDefault: boolean;
}

export class List implements ListDetails {
  id?: string;
  name: string;
  userId: string;
  isDefault: boolean;

  constructor(name: string, userId: string, isDefault = false, id?: string) {
    this.id = id;
    this.name = name;
    this.userId = userId;
    this.isDefault = isDefault;
  }

  save(): Promise<string> {
    return create(this);
  }

  static delete = async (listId: string, userId: string): Promise<void> => {
    await deleteList(listId, userId);
  };

  static getAll = (userId: string): Promise<ListDetails[]> => {
    return getAll(userId);
  };
}
