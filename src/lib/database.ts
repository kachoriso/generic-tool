// Neon PostgreSQL データベースクライアント

import { Pool } from 'pg';
import type { QueryResult } from 'pg';

// PostgreSQL接続プール（シングルトン）
let pool: Pool | null = null;

/**
 * データベース接続プールを初期化
 */
function getPool(): Pool {
  if (!pool) {
    // SSL設定の改善 - Neon対応
    const sslConfig = { rejectUnauthorized: false };
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
      // 接続プール設定
      max: 20,          // 最大接続数
      min: 5,           // 最小接続数
      idleTimeoutMillis: 30000,  // アイドルタイムアウト（30秒）
      connectionTimeoutMillis: 15000, // 接続タイムアウト（15秒）
    });

    // エラーハンドリング
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });

    pool.on('connect', () => {
      console.log('✅ Connected to Neon PostgreSQL');
    });
  }

  return pool;
}

/**
 * データベースクエリ実行
 * @param text SQLクエリ文字列
 * @param values パラメータ配列
 * @returns クエリ結果
 */
export async function query<T = any>(
  text: string,
  values?: any[]
): Promise<QueryResult<T>> {
  const client = getPool();
  
  try {
    const start = Date.now();
    const result = await client.query<T>(text, values);
    const duration = Date.now() - start;
    
    // 開発環境でのクエリログ
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed:', {
        duration: `${duration}ms`,
        rows: result.rowCount,
        query: text
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

/**
 * トランザクション実行
 * @param callback トランザクション内で実行する処理
 * @returns 処理結果
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * データベース接続テスト
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('🔗 Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

/**
 * データベース接続プールを閉じる
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 Database pool closed');
  }
}

// プロセス終了時にプールを閉じる
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool); 