// ポケモンGO PvPパーティ管理システム データベース型定義

// =====================================================
// メインテーブル型定義
// =====================================================

/**
 * PvPパーティテーブル型定義
 */
export interface PvpParty {
  id: string;
  title?: string | null;
  league: League;
  custom_league?: string | null;
  party_image_url?: string | null;
  cropped_image_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * ポケモンテーブル型定義
 */
export interface Pokemon {
  id: string;
  party_id: string;
  pokemon_order: PokemonOrder;
  normal_move?: string | null;
  special_move_1?: string | null;
  special_move_2?: string | null;
  created_at: Date;
}

/**
 * ワザマスターテーブル型定義
 */
export interface Move {
  id: string;
  name: string;
  move_type: MoveType;
  type_name?: string | null;
  power?: number | null;
  energy_cost?: number | null;
  duration_ms?: number | null;
  created_at: Date;
}

// =====================================================
// Enum型定義
// =====================================================

/**
 * リーグ種別
 */
export type League = 
  | 'スーパーリーグ'
  | 'ハイパーリーグ'
  | 'マスターリーグ'
  | 'マスタークラシック'
  | 'ジョウトカップ'
  | 'シンオウカップ'
  | 'ホウエンカップ'
  | 'カントーカップ'
  | 'その他';

/**
 * ポケモンの順番（1, 2, 3番目）
 */
export type PokemonOrder = 1 | 2 | 3;

/**
 * ワザの種類
 */
export type MoveType = 'normal' | 'special';

/**
 * ポケモンのタイプ
 */
export type PokemonType =
  | 'ノーマル' | 'ほのお' | 'みず' | 'でんき' | 'くさ' | 'こおり'
  | 'かくとう' | 'どく' | 'じめん' | 'ひこう' | 'エスパー' | 'むし'
  | 'いわ' | 'ゴースト' | 'ドラゴン' | 'あく' | 'はがね' | 'フェアリー';

// =====================================================
// API リクエスト・レスポンス型定義
// =====================================================

/**
 * パーティ作成・更新用の入力型
 */
export interface PvpPartyInput {
  title?: string;
  league: League;
  custom_league?: string;
  party_image_url?: string;
  cropped_image_url?: string;
  pokemon: PokemonInput[];
}

/**
 * ポケモン入力用の型
 */
export interface PokemonInput {
  pokemon_order: PokemonOrder;
  normal_move?: string;
  special_move_1?: string;
  special_move_2?: string;
}

/**
 * パーティの詳細取得用（ポケモン情報含む）
 */
export interface PvpPartyDetail extends PvpParty {
  pokemon: Pokemon[];
}

/**
 * データベースクエリ用のフィルター型
 */
export interface PvpPartyFilter {
  league?: League;
  title?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

// =====================================================
// エラーハンドリング型定義
// =====================================================

/**
 * API エラーレスポンス
 */
export interface ApiError {
  error: string;
  message: string;
  status: number;
}

/**
 * データベース操作結果
 */
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// =====================================================
// ユーティリティ型定義
// =====================================================

/**
 * パーティ作成時の型（IDと日時を除く）
 */
export type CreatePvpParty = Omit<PvpParty, 'id' | 'created_at' | 'updated_at'>;

/**
 * パーティ更新時の型（IDと作成日時を除く、更新日時は自動）
 */
export type UpdatePvpParty = Omit<PvpParty, 'id' | 'created_at' | 'updated_at'>;

/**
 * ポケモン作成時の型（IDと作成日時を除く）
 */
export type CreatePokemon = Omit<Pokemon, 'id' | 'created_at'>;

/**
 * ワザ作成時の型（IDと作成日時を除く）
 */
export type CreateMove = Omit<Move, 'id' | 'created_at'>;

// =====================================================
// 定数
// =====================================================

/**
 * 利用可能なリーグ一覧
 */
export const LEAGUES: readonly League[] = [
  'スーパーリーグ',
  'ハイパーリーグ', 
  'マスターリーグ',
  'マスタークラシック',
  'ジョウトカップ',
  'シンオウカップ',
  'ホウエンカップ',
  'カントーカップ',
  'その他'
] as const;

/**
 * ポケモンの順番一覧
 */
export const POKEMON_ORDERS: readonly PokemonOrder[] = [1, 2, 3] as const;

/**
 * ワザの種類一覧
 */
export const MOVE_TYPES: readonly MoveType[] = ['normal', 'special'] as const; 