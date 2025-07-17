import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { query, testConnection } from '../src/lib/database';

// 環境変数の読み込み
dotenv.config({ path: '.env.local' });

async function initializeDatabase() {
  try {
    console.log('🚀 データベース初期化を開始...');
    
    // 環境変数の確認
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL環境変数が設定されていません');
    }

    // SQLファイルの読み込み
    const sqlFilePath = path.join(process.cwd(), 'database', 'init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    console.log('📄 SQLファイルを読み込みました:', sqlFilePath);

    // SQLをより適切に分割して実行
    // $$で囲まれた関数定義やDOブロックを考慮した分割
    const sqlStatements: string[] = [];
    let currentStatement = '';
    let inDollarQuote = false;
    
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // コメント行をスキップ
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // $$の開始/終了を検出
      if (trimmedLine.includes('$$')) {
        inDollarQuote = !inDollarQuote;
      }
      
      // セミコロンで終わり、かつ$$ブロック内でない場合はステートメント終了
      if (trimmedLine.endsWith(';') && !inDollarQuote) {
        const statement = currentStatement.trim();
        if (statement.length > 0) {
          sqlStatements.push(statement);
        }
        currentStatement = '';
      }
    }
    
    // 最後のステートメントが残っている場合
    if (currentStatement.trim().length > 0) {
      sqlStatements.push(currentStatement.trim());
    }

    console.log(`📊 ${sqlStatements.length}個のSQLステートメントを実行します...`);

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      if (statement.trim()) {
        try {
          console.log(`  ${i + 1}/${sqlStatements.length}: 実行中...`);
          console.log(`  📝 ステートメント: ${statement.substring(0, 100)}...`);
          await query(statement);
          console.log(`  ✅ ステートメント ${i + 1} 完了`);
        } catch (error) {
          console.error(`  ❌ ステートメント ${i + 1} でエラー:`, error);
          console.error(`  📝 問題のあるステートメント:`, statement);
          // テーブルが既に存在する場合のエラーは無視
          if (error instanceof Error && (
            error.message.includes('already exists') ||
            error.message.includes('duplicate key value')
          )) {
            console.log(`  ⚠️  リソースは既に存在します（スキップ）`);
            continue;
          }
          throw error;
        }
      }
    }

    console.log('✅ データベース初期化が完了しました！');
    
    // 接続テスト
    console.log('🔍 接続テストを実行...');
    const testResult = await testConnection();
    console.log('📊 接続テスト結果:', testResult);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ データベース初期化エラー:', error);
    process.exit(1);
  }
}

initializeDatabase(); 