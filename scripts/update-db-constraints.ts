import { query, closePool } from '../src/lib/database';
import { readFileSync } from 'fs';
import path from 'path';

async function updateDatabaseConstraints() {
  console.log('🚀 データベース制約の更新を開始...');
  
  try {
    // SQLファイルを読み込み
    const sqlFile = path.join(process.cwd(), 'database/update-league-constraints.sql');
    const sql = readFileSync(sqlFile, 'utf-8');
    
    // SQLステートメントを分割して実行
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));
    
    console.log(`📝 ${statements.length}個のSQLステートメントを実行します...`);
    
    for (const statement of statements) {
      console.log(`🔄 実行中: ${statement.substring(0, 100)}...`);
      await query(statement);
      console.log('✅ 完了');
    }
    
    console.log('🎉 データベース制約の更新が完了しました！');
    
    // 確認クエリ
    const result = await query(`
      SELECT conname, consrc 
      FROM pg_constraint 
      WHERE conname = 'pvp_parties_league_check'
    `);
    
    console.log('📊 更新された制約の確認:');
    console.log(result.rows);
    
  } catch (error) {
    console.error('❌ データベース制約更新エラー:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

updateDatabaseConstraints(); 