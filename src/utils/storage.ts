import type { TodoItem, TodoGroup, AppState } from '../types';

const STORAGE_KEY = 'todo-app-data';

const defaultGroups: TodoGroup[] = [
  {
    id: 'general',
    name: '一般',
    color: '#3b82f6',
    createdAt: new Date(),
  },
];

export const loadAppState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        todos: parsed.todos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        })),
        groups: parsed.groups.map((group: any) => ({
          ...group,
          createdAt: new Date(group.createdAt),
        })),
        selectedGroupId: parsed.selectedGroupId,
      };
    }
  } catch (error) {
    console.error('Failed to load app state:', error);
  }
  
  return {
    todos: [],
    groups: defaultGroups,
    selectedGroupId: 'general',
  };
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
}; 