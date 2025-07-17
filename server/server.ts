import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from '../src/lib/database';

// 環境変数の読み込み
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// 静的ファイルの提供（ビルドされたReactアプリ）
app.use(express.static('dist'));

// API ルート
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('データベース接続テストを開始...');
    
    // 環境変数の確認
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL 環境変数が設定されていません');
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL環境変数が設定されていません',
        timestamp: new Date().toISOString()
      });
    }

    console.log('DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...');

    // データベース接続テスト
    const result = await testConnection();
    
    console.log('データベース接続テスト成功:', result);
    
    res.json({
      success: true,
      message: 'データベース接続が成功しました！',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('データベース接続エラー:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// React アプリの提供（全てのルートでindex.htmlを返す）
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`);
  console.log(`📊 データベーステストURL: http://localhost:${PORT}/api/test-db`);
  console.log(`🎮 アプリURL: http://localhost:${PORT}`);
});

export default app; 