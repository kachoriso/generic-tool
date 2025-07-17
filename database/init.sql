-- ポケモンGO PvPパーティ管理システム データベース初期化スクリプト
-- Neon PostgreSQL用

-- 1. パーティテーブル
CREATE TABLE IF NOT EXISTS pvp_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    league VARCHAR(50) NOT NULL CHECK (league IN (
        'スーパーリーグ', 'ハイパーリーグ', 'マスターリーグ', 'マスタークラシック',
        'プレミアカップ', 'エレメントカップ', 'カントーカップ', 'ジョウトカップ', 
        'シンオウカップ', 'ホウエンカップ', 'ガラルカップ', 'アローラカップ',
        '陽光カップ', 'ホリデーカップ', 'ラブカップ', 'リトルカップ', 
        'ファンタジーカップ', 'ナイトメアカップ', 'フェアリーカップ',
        'ゴーストカップ', 'ジャングルカップ', 'サンダーカップ', 'クロスカップ',
        'その他'
    )),
    custom_league VARCHAR(100),
    party_image_url TEXT,
    cropped_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ポケモンテーブル
CREATE TABLE IF NOT EXISTS pokemon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES pvp_parties(id) ON DELETE CASCADE,
    pokemon_order INTEGER NOT NULL CHECK (pokemon_order IN (1, 2, 3)),
    normal_move VARCHAR(100),
    special_move_1 VARCHAR(100),
    special_move_2 VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(party_id, pokemon_order)
);

-- 3. ワザマスターテーブル
CREATE TABLE IF NOT EXISTS moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    move_type VARCHAR(20) NOT NULL CHECK (move_type IN ('normal', 'special')),
    type_name VARCHAR(50),
    power INTEGER,
    energy_cost INTEGER,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. インデックス作成
CREATE INDEX IF NOT EXISTS idx_pvp_parties_league ON pvp_parties(league);
CREATE INDEX IF NOT EXISTS idx_pvp_parties_created_at ON pvp_parties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pokemon_party_id ON pokemon(party_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_order ON pokemon(party_id, pokemon_order);
CREATE INDEX IF NOT EXISTS idx_moves_type ON moves(move_type);
CREATE INDEX IF NOT EXISTS idx_moves_name ON moves(name);

-- 5. 更新日時自動更新の関数とトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pvp_parties_updated_at ON pvp_parties;
CREATE TRIGGER update_pvp_parties_updated_at 
    BEFORE UPDATE ON pvp_parties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 基本的なワザデータの挿入
INSERT INTO moves (name, move_type, type_name, power, energy_cost) VALUES
-- 通常ワザ（一部）
('マッドショット', 'normal', 'じめん', 5, 7),
('りゅうのいぶき', 'normal', 'ドラゴン', 6, 4),
('でんきショック', 'normal', 'でんき', 5, 8),
('みずでっぽう', 'normal', 'みず', 5, 8),
('つるのムチ', 'normal', 'くさ', 7, 6),
('ひのこ', 'normal', 'ほのお', 7, 6),
-- スペシャルワザ（一部）
('じしん', 'special', 'じめん', 120, 65),
('ドラゴンクロー', 'special', 'ドラゴン', 50, 35),
('10まんボルト', 'special', 'でんき', 90, 55),
('ハイドロポンプ', 'special', 'みず', 130, 75),
('リーフブレード', 'special', 'くさ', 70, 35),
('だいもんじ', 'special', 'ほのお', 140, 80)
ON CONFLICT (name) DO NOTHING;

-- 7. サンプルデータ（テスト用）
INSERT INTO pvp_parties (title, league) VALUES
('最強スーパーリーグパーティ', 'スーパーリーグ'),
('ハイパーリーグテスト', 'ハイパーリーグ')
ON CONFLICT DO NOTHING;

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ データベース初期化完了: ポケモンGO PvPパーティ管理システム';
    RAISE NOTICE '📊 作成されたテーブル: pvp_parties, pokemon, moves';
    RAISE NOTICE '🚀 基本的なワザデータが登録されました';
END $$; 