import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection } from '../src/lib/database';
import { PvpPartyRepository } from '../src/lib/repositories/pvpPartyRepository';
import { query } from '../src/lib/database';

// 環境変数の読み込み
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 静的ファイルの提供（ビルドされたReactアプリ）
app.use(express.static('dist'));

// Repositoryインスタンス
const pvpPartyRepository = new PvpPartyRepository();

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// データベーステストAPI
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
    const testResult = await testConnection();
    
    if (testResult.success) {
      console.log('データベース接続テスト成功:', testResult.details);
      
      res.json({
        success: true,
        message: 'データベース接続が成功しました！',
        result: testResult.details,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('データベース接続テスト失敗:', testResult.error);
      
      res.status(500).json({
        success: false,
        error: testResult.error,
        details: testResult.details,
        timestamp: new Date().toISOString()
      });
    }
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

// データベース制約更新
app.post('/api/admin/update-constraints', async (req, res) => {
  try {
    console.log('🚀 データベース制約の更新を開始...');
    
    // 既存の制約を削除
    await query(`
      ALTER TABLE pvp_parties DROP CONSTRAINT IF EXISTS pvp_parties_league_check
    `);
    console.log('✅ 既存制約を削除');
    
    // 新しい制約を追加
    await query(`
      ALTER TABLE pvp_parties ADD CONSTRAINT pvp_parties_league_check 
      CHECK (league IN (
          'スーパーリーグ', 'ハイパーリーグ', 'マスターリーグ', 'マスタークラシック',
          'プレミアカップ', 'エレメントカップ', 'カントーカップ', 'ジョウトカップ', 
          'シンオウカップ', 'ホウエンカップ', 'ガラルカップ', 'アローラカップ',
          '陽光カップ', 'ホリデーカップ', 'ラブカップ', 'リトルカップ', 
          'ファンタジーカップ', 'ナイトメアカップ', 'フェアリーカップ',
          'ゴーストカップ', 'ジャングルカップ', 'サンダーカップ', 'クロスカップ',
          'その他'
      ))
    `);
    console.log('✅ 新制約を追加');
    
    // 確認クエリ
    const result = await query(`
      SELECT conname, consrc 
      FROM pg_constraint 
      WHERE conname = 'pvp_parties_league_check'
    `);
    
    console.log('🎉 データベース制約の更新が完了しました！');
    
    res.json({
      success: true,
      message: 'データベース制約が正常に更新されました',
      constraint: result.rows[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ データベース制約更新エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '制約更新に失敗しました',
      timestamp: new Date().toISOString()
    });
  }
});

// =========================
// パーティ管理API
// =========================

// パーティ一覧取得
app.get('/api/parties', async (req, res) => {
  try {
    const { league, title, limit } = req.query;
    
    const filter: any = {};
    if (league) filter.league = league as string;
    if (title) filter.title = title as string;
    if (limit) filter.limit = parseInt(limit as string, 10);

    const parties = await pvpPartyRepository.findAll(filter);
    const totalCount = await pvpPartyRepository.count(filter);

    res.json({
      success: true,
      data: parties,
      meta: {
        total: totalCount,
        count: parties.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('パーティ一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    });
  }
});

// パーティ詳細取得
app.get('/api/parties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // UUIDの簡単な検証
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: '無効なパーティIDです',
        timestamp: new Date().toISOString()
      });
    }

    const party = await pvpPartyRepository.findById(id);
    
    if (!party) {
      return res.status(404).json({
        success: false,
        error: 'パーティが見つかりません',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: party,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('パーティ詳細取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    });
  }
});

// パーティ作成API
app.post('/api/parties', async (req, res) => {
  try {
    const formData = req.body;
    console.log('🎮 パーティ作成リクエスト受信:');
    console.log('  📝 タイトル:', formData.title);
    console.log('  🏆 リーグ:', formData.league);
    console.log('  🐾 ポケモン1:', JSON.stringify(formData.pokemon1, null, 2));
    console.log('  🐾 ポケモン2:', JSON.stringify(formData.pokemon2, null, 2));
    console.log('  🐾 ポケモン3:', JSON.stringify(formData.pokemon3, null, 2));
    console.log('  🖼️ 画像あり:', !!formData.image, '長さ:', formData.image?.length || 0);
    console.log('  ✂️ 切り抜き画像あり:', !!formData.croppedImage, '長さ:', formData.croppedImage?.length || 0);
    console.log('  🔍 全キー:', Object.keys(formData));
    console.log('  📦 全データ (文字列化):', JSON.stringify(formData).substring(0, 500) + '...');
    
    // 各ポケモンデータの型確認
    console.log('  🔍 ポケモンデータ詳細検査:');
    ['pokemon1', 'pokemon2', 'pokemon3'].forEach((key, index) => {
      const pokemon = formData[key];
      console.log(`    ${key}:`, {
        exists: pokemon !== undefined,
        type: typeof pokemon,
        isNull: pokemon === null,
        value: pokemon,
        hasNormalMove: pokemon?.normalMove !== undefined,
        normalMoveValue: pokemon?.normalMove
      });
    });
    
    // フォームデータをデータベース形式に変換
    console.log('📁 partyDataAdapterのインポートを試行中...');
    let partyData: any;
    try {
      const adapterModule = await import('../src/utils/partyDataAdapter.js');
      console.log('✅ アダプターモジュール取得成功:', Object.keys(adapterModule));
      const { convertFormToDbInput, validatePartyInput } = adapterModule;
      
      // バリデーション
      console.log('🔍 バリデーション実行中...');
      const validationErrors = validatePartyInput(formData);
      console.log('📋 バリデーション結果:', validationErrors);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: validationErrors.join(', '),
          timestamp: new Date().toISOString()
        });
      }

      // フォームデータをDB形式に変換
      console.log('🔄 convertFormToDbInput実行中...');
      partyData = convertFormToDbInput(formData);
      console.log('🎯 変換後のパーティデータ:', JSON.stringify(partyData, null, 2));
    } catch (importError) {
      console.error('❌ アダプターインポートエラー:', importError);
      return res.status(500).json({
        success: false,
        error: 'データ変換モジュールの読み込みに失敗しました',
        timestamp: new Date().toISOString()
      });
    }

    // ポケモンの順序をバリデーション
    if (partyData.pokemon && partyData.pokemon.length > 0) {
      const orders = partyData.pokemon.map((p: any) => p.pokemon_order);
      const uniqueOrders = [...new Set(orders)];
      
      if (orders.length !== uniqueOrders.length) {
        return res.status(400).json({
          success: false,
          error: 'ポケモンの順序は重複できません',
          timestamp: new Date().toISOString()
        });
      }

      if (orders.some((order: number) => order < 1 || order > 3)) {
        return res.status(400).json({
          success: false,
          error: 'ポケモンの順序は1-3の範囲で指定してください',
          timestamp: new Date().toISOString()
        });
      }
    }

    const createdParty = await pvpPartyRepository.create(partyData);

    res.status(201).json({
      success: true,
      message: 'パーティが正常に作成されました',
      data: createdParty,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('パーティ作成エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    });
  }
});

// パーティ更新
app.put('/api/parties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    
    // UUIDの検証
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: '無効なパーティIDです',
        timestamp: new Date().toISOString()
      });
    }

    // フォームデータをデータベース形式に変換
    let partyData: any;
    try {
      const { convertFormToDbInput, validatePartyInput } = await import('../src/utils/partyDataAdapter.js');
      
      // バリデーション
      const validationErrors = validatePartyInput(formData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: validationErrors.join(', '),
          timestamp: new Date().toISOString()
        });
      }

      // フォームデータをDB形式に変換
      partyData = convertFormToDbInput(formData);
    } catch (importError) {
      console.error('❌ アダプター更新インポートエラー:', importError);
      return res.status(500).json({
        success: false,
        error: 'データ変換モジュールの読み込みに失敗しました',
        timestamp: new Date().toISOString()
      });
    }

    // ポケモンの順序をバリデーション
    if (partyData.pokemon && partyData.pokemon.length > 0) {
      const orders = partyData.pokemon.map((p: any) => p.pokemon_order);
      const uniqueOrders = [...new Set(orders)];
      
      if (orders.length !== uniqueOrders.length) {
        return res.status(400).json({
          success: false,
          error: 'ポケモンの順序は重複できません',
          timestamp: new Date().toISOString()
        });
      }

      if (orders.some((order: number) => order < 1 || order > 3)) {
        return res.status(400).json({
          success: false,
          error: 'ポケモンの順序は1-3の範囲で指定してください',
          timestamp: new Date().toISOString()
        });
      }
    }

    const updatedParty = await pvpPartyRepository.update(id, partyData);
    
    if (!updatedParty) {
      return res.status(404).json({
        success: false,
        error: 'パーティが見つかりません',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'パーティが正常に更新されました',
      data: updatedParty,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('パーティ更新エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    });
  }
});

// パーティ削除
app.delete('/api/parties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // UUIDの検証
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: '無効なパーティIDです',
        timestamp: new Date().toISOString()
      });
    }

    const deleted = await pvpPartyRepository.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'パーティが見つかりません',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'パーティが正常に削除されました',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('パーティ削除エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    });
  }
});

// リーグ別統計取得
app.get('/api/parties/stats/leagues', async (req, res) => {
  try {
    const stats = await pvpPartyRepository.getLeagueStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('リーグ統計取得エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    });
  }
});

// デバッグ用API - 最後に作成されたパーティの詳細を確認
app.get('/api/debug/latest-party', async (req, res) => {
  try {
    console.log('🔍 最新パーティの詳細をデバッグ確認中...');
    
    // 最新のパーティを取得
    const latestParty = await pvpPartyRepository.findAll({ limit: 1 });
    
    if (latestParty.length === 0) {
      return res.json({
        success: false,
        message: '登録されたパーティがありません',
        timestamp: new Date().toISOString()
      });
    }
    
    // パーティの詳細情報を取得
    const partyDetail = await pvpPartyRepository.findById(latestParty[0].id);
    
    if (!partyDetail) {
      return res.json({
        success: false,
        message: 'パーティの詳細が見つかりません',
        timestamp: new Date().toISOString()
      });
    }
    
    // デバッグ情報を構築
    const debugInfo = {
      party: {
        id: partyDetail.id,
        title: partyDetail.title,
        league: partyDetail.league,
        custom_league: partyDetail.custom_league,
        hasPartyImage: !!partyDetail.party_image_url,
        hasCroppedImage: !!partyDetail.cropped_image_url,
        partyImageSize: partyDetail.party_image_url ? Math.round(partyDetail.party_image_url.length / 1024) + 'KB' : '0KB',
        croppedImageSize: partyDetail.cropped_image_url ? Math.round(partyDetail.cropped_image_url.length / 1024) + 'KB' : '0KB',
        created_at: partyDetail.created_at
      },
      pokemon: partyDetail.pokemon.map(p => ({
        id: p.id,
        pokemon_order: p.pokemon_order,
        normal_move: p.normal_move,
        special_move_1: p.special_move_1,
        special_move_2: p.special_move_2,
        hasNormalMove: !!p.normal_move,
        hasSpecialMove1: !!p.special_move_1,
        hasSpecialMove2: !!p.special_move_2,
        normalMoveLength: p.normal_move?.length || 0,
        specialMove1Length: p.special_move_1?.length || 0,
        specialMove2Length: p.special_move_2?.length || 0
      })),
      summary: {
        totalPokemon: partyDetail.pokemon.length,
        pokemonWithMoves: partyDetail.pokemon.filter(p => p.normal_move || p.special_move_1 || p.special_move_2).length,
        pokemonWithNormalMoves: partyDetail.pokemon.filter(p => p.normal_move).length,
        pokemonWithSpecialMoves: partyDetail.pokemon.filter(p => p.special_move_1 || p.special_move_2).length
      }
    };
    
    console.log('🎯 デバッグ情報:', JSON.stringify(debugInfo, null, 2));
    
    res.json({
      success: true,
      data: debugInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ デバッグAPI エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    });
  }
});

// React Routerのフォールバック（全てのルートでindex.htmlを返す）
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 PvPパーティ管理APIサーバーがポート ${PORT} で起動しました`);
  console.log(`\n📋 利用可能なエンドポイント:`);
  console.log(`  ヘルスチェック: GET /health`);
  console.log(`  DB接続テスト: GET /api/test-db`);
  console.log(`  \n🎮 パーティ管理API:`);
  console.log(`  パーティ一覧: GET /api/parties`);
  console.log(`  パーティ詳細: GET /api/parties/:id`);
  console.log(`  パーティ作成: POST /api/parties`);
  console.log(`  パーティ更新: PUT /api/parties/:id`);
  console.log(`  パーティ削除: DELETE /api/parties/:id`);
  console.log(`  リーグ統計: GET /api/parties/stats/leagues`);
  console.log(`\n🌐 サーバーURL: http://localhost:${PORT}`);
});

export default app; 