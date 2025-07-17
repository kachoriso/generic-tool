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

// 価格計算機用の型
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

// ポケモンPvP用の型
export interface PokemonMove {
  normalMove: string;    // 通常ワザ
  specialMove1: string;  // SPワザ1
  specialMove2: string;  // SPワザ2
}

export interface Pokemon extends PokemonMove {
  id: string;
}

export interface PvpParty {
  id: string;
  title: string;
  league: string;        // カスタムリーグ名対応
  pokemon1: Pokemon;
  pokemon2: Pokemon;
  pokemon3: Pokemon;
  image?: string;        // 画像のURL（Base64またはURL）
  croppedImage?: string; // 切り抜き後の画像
  createdAt: Date;
}

export interface PvpPartyState {
  parties: PvpParty[];
} 