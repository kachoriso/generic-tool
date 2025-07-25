-- ポケモンGO PvPパーティ管理システム リーグ制約更新スクリプト
-- 陽光カップや他のリーグを追加

-- 既存の制約を削除
ALTER TABLE pvp_parties DROP CONSTRAINT IF EXISTS pvp_parties_league_check;

-- 新しい制約を追加（より多くのリーグを含む）
ALTER TABLE pvp_parties ADD CONSTRAINT pvp_parties_league_check 
CHECK (league IN (
    'スーパーリーグ', 'ハイパーリーグ', 'マスターリーグ', 'マスタークラシック',
    'プレミアカップ', 'エレメントカップ', 'カントーカップ', 'ジョウトカップ', 
    'シンオウカップ', 'ホウエンカップ', 'ガラルカップ', 'アローラカップ',
    '陽光カップ', 'ホリデーカップ', 'ラブカップ', 'リトルカップ', 
    'ファンタジーカップ', 'ナイトメアカップ', 'フェアリーカップ',
    'ゴーストカップ', 'ジャングルカップ', 'サンダーカップ', 'クロスカップ',
    'その他'
)); 