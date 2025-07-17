// データベース接続テスト用APIエンドポイント

import type { NextApiRequest, NextApiResponse } from 'next';
import { testConnection } from '../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.status(200).json({
        success: true,
        message: '✅ Neon PostgreSQL接続成功',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: '❌ データベース接続失敗'
      });
    }
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: '❌ データベース接続エラー',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 