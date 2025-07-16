export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  groupId: string;
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
  selectedGroupId: string;
}

// 新しく価格計算機用の型を追加
export interface PriceItem {
  id: string;
  volume: number;
  price: number;
}

export type VolumeUnit = 'ml' | 'g' | 'piece' | 'L' | 'kg';

export interface PriceCalculatorState {
  priceItems: PriceItem[];
  targetVolume: number;
  selectedUnit: VolumeUnit;
} 