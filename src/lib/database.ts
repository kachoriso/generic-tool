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
    // Neon PostgreSQL用の最適化された設定
    const sslConfig = { 
      rejectUnauthorized: false,
      // Neonでのタイムアウト対策
      checkServerIdentity: () => undefined
    };
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
      // 接続プール設定 - Neon向けに最適化
      max: 10,          // 最大接続数（Neonの制限を考慮）
      min: 2,           // 最小接続数
      idleTimeoutMillis: 60000,  // アイドルタイムアウト（60秒）
      connectionTimeoutMillis: 30000, // 接続タイムアウト（30秒に延長）
      // 再接続設定
      allowExitOnIdle: false,
    });

    // 詳細なエラーハンドリング
    pool.on('error', (err: any) => {
      console.error('💥 PostgreSQL pool error:', {
        message: err.message,
        code: err.code || 'UNKNOWN',
        severity: err.severity || 'ERROR',
        detail: err.detail || 'No details available',
        timestamp: new Date().toISOString()
      });
    });

    pool.on('connect', (client) => {
      console.log('✅ Connected to Neon PostgreSQL');
      
      // 接続時のデバッグ情報
      client.on('error', (err: any) => {
        console.error('💥 PostgreSQL client error:', {
          message: err.message,
          code: err.code || 'UNKNOWN',
          timestamp: new Date().toISOString()
        });
      });
    });

    pool.on('acquire', () => {
      console.log('🔗 Database connection acquired from pool');
    });

    pool.on('release', () => {
      console.log('🔓 Database connection released to pool');
    });
  }

  return pool;
}

/**
 * データベースクエリ実行（再試行機能付き）
 * @param text SQLクエリ文字列
 * @param values パラメータ配列
 * @param retries 再試行回数
 * @returns クエリ結果
 */
export async function query<T = any>(
  text: string,
  values?: any[],
  retries: number = 2
): Promise<QueryResult<T>> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const client = getPool();
      const start = Date.now();
      const result = await client.query<T>(text, values);
      const duration = Date.now() - start;
      
      // 開発環境でのクエリログ
      if (process.env.NODE_ENV === 'development' || attempt > 0) {
        console.log('📊 Query executed:', {
          duration: `${duration}ms`,
          rows: result.rowCount,
          attempt: attempt + 1,
          query: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        });
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Database query error (attempt ${attempt + 1}/${retries + 1}):`, {
        message: lastError.message,
        code: (lastError as any).code,
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        attempt: attempt + 1
      });
      
      // 最後の試行でない場合は少し待機
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${(attempt + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
      }
    }
  }
  
  throw lastError;
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
export async function testConnection(): Promise<{ success: boolean; details?: any; error?: string }> {
  try {
    console.log('🔗 Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('🔗 Database connection test successful:', result.rows[0]);
    
    return {
      success: true,
      details: {
        current_time: result.rows[0]?.current_time,
        pg_version: result.rows[0]?.pg_version?.substring(0, 50) + '...',
        row_count: result.rowCount
      }
    };
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        error_code: (error as any)?.code,
        error_name: (error as any)?.name
      }
    };
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