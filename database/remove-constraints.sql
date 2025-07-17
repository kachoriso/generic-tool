-- ポケモンGO PvPパーティ管理システム 制約削除スクリプト
-- リーグ制約を削除してカスタムリーグを許可

-- 既存の制約を削除
ALTER TABLE pvp_parties DROP CONSTRAINT IF EXISTS pvp_parties_league_check;

-- 確認：制約が削除されたことを確認
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'pvp_parties'::regclass 
AND conname LIKE '%league%';

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ リーグ制約削除完了: カスタムリーグが使用可能になりました';
END $$; 