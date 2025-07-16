export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  groupId?: string;
}

export interface TodoGroup {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface AppState {
  todos: TodoItem[];
  groups: TodoGroup[];
  selectedGroupId?: string;
} 