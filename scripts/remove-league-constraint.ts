import dotenv from 'dotenv';
import { query } from '../src/lib/database';

// 環境変数の読み込み
dotenv.config({ path: '.env.local' });

async function removeLeagueConstraint() {
  try {
    console.log('🚀 リーグ制約の削除を開始...');
    
    // 既存の制約を削除
    await query(`
      ALTER TABLE pvp_parties DROP CONSTRAINT IF EXISTS pvp_parties_league_check
    `);
    console.log('✅ リーグ制約を削除しました');
    
    // 確認クエリ
    const result = await query(`
      SELECT conname, consrc 
      FROM pg_constraint 
      WHERE conrelid = 'pvp_parties'::regclass 
      AND conname LIKE '%league%'
    `);
    
    console.log('📊 現在の制約一覧:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('✅ リーグ制約が正常に削除されました。カスタムリーグが使用可能になりました。');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

removeLeagueConstraint(); 