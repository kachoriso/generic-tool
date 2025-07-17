import type { PvpParty, PvpPartyDetail, PvpPartyInput, PvpPartyFilter } from '../types/database';

// API ベースURL（開発環境では3001ポート、本番環境では相対パス）
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://192.168.0.13:3001' 
  : '';

/**
 * API レスポンスの共通型
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta?: {
    total: number;
    count: number;
  };
}

/**
 * HTTP リクエストを実行するヘルパー関数
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log('🚀 API Request:', {
    url,
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body
  });

  try {
    const response = await fetch(url, config);
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error Response:', errorData);
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ API Success Response:', result);
    return result;
  } catch (error) {
    console.error(`❌ API Request Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * パーティ管理 API クライアント
 */
export class PartyApiClient {
  /**
   * パーティ一覧を取得
   */
  static async getParties(filter?: PvpPartyFilter): Promise<{
    parties: PvpParty[];
    total: number;
  }> {
    const params = new URLSearchParams();
    
    if (filter?.league) params.append('league', filter.league);
    if (filter?.title) params.append('title', filter.title);
    if (filter?.limit) params.append('limit', filter.limit.toString());

    const queryString = params.toString();
    const endpoint = `/api/parties${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest<ApiListResponse<PvpParty>>(endpoint);
    
    return {
      parties: response.data || [],
      total: response.meta?.total || 0,
    };
  }

  /**
   * パーティ詳細を取得
   */
  static async getParty(id: string): Promise<PvpPartyDetail> {
    const response = await apiRequest<ApiResponse<PvpPartyDetail>>(`/api/parties/${id}`);
    
    if (!response.data) {
      throw new Error('パーティデータが見つかりません');
    }

    return response.data;
  }

  /**
   * パーティを作成
   */
  static async createParty(partyData: PvpPartyInput): Promise<PvpPartyDetail> {
    const response = await apiRequest<ApiResponse<PvpPartyDetail>>('/api/parties', {
      method: 'POST',
      body: JSON.stringify(partyData),
    });

    if (!response.data) {
      throw new Error('パーティの作成に失敗しました');
    }

    return response.data;
  }

  /**
   * パーティを更新
   */
  static async updateParty(
    id: string, 
    partyData: Partial<PvpPartyInput>
  ): Promise<PvpPartyDetail> {
    const response = await apiRequest<ApiResponse<PvpPartyDetail>>(`/api/parties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partyData),
    });

    if (!response.data) {
      throw new Error('パーティの更新に失敗しました');
    }

    return response.data;
  }

  /**
   * パーティを削除
   */
  static async deleteParty(id: string): Promise<void> {
    await apiRequest<ApiResponse<void>>(`/api/parties/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * リーグ別統計を取得
   */
  static async getLeagueStats(): Promise<{ league: string; count: number }[]> {
    const response = await apiRequest<ApiResponse<{ league: string; count: number }[]>>(
      '/api/parties/stats/leagues'
    );

    return response.data || [];
  }
}

/**
 * システム API クライアント
 */
export class SystemApiClient {
  /**
   * ヘルスチェック
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return await apiRequest<{ status: string; timestamp: string }>('/health');
  }

  /**
   * データベース接続テスト
   */
  static async testDatabase(): Promise<boolean> {
    const response = await apiRequest<ApiResponse<boolean>>('/api/test-db');
    return response.data || false;
  }
}

/**
 * API エラー処理用のヘルパー関数
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '不明なエラーが発生しました';
}

/**
 * ローディング状態管理用のカスタムフック
 */
import { useState } from 'react';

export function useApiState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
} 