import type { PvpParty, Pokemon } from '../types';
import type { PvpPartyInput, PvpPartyDetail, Pokemon as DbPokemon, League } from '../types/database';

/**
 * 既存のフォーム形式のPvpPartyをデータベース形式のPvpPartyInputに変換
 */
export function convertFormToDbInput(formParty: Omit<PvpParty, 'id' | 'createdAt'>): PvpPartyInput {
  console.log('🔍 convertFormToDbInput: 受信データ詳細', {
    formParty,
    keys: Object.keys(formParty),
    image: formParty.image,
    croppedImage: formParty.croppedImage,
    hasImage: !!formParty.image,
    hasCroppedImage: !!formParty.croppedImage,
    pokemon1: formParty.pokemon1,
    pokemon2: formParty.pokemon2,
    pokemon3: formParty.pokemon3,
    hasPokemon1: !!formParty.pokemon1,
    hasPokemon2: !!formParty.pokemon2,
    hasPokemon3: !!formParty.pokemon3
  });

  // ポケモンデータの安全な取得用のヘルパー関数
  const safeGetPokemon = (pokemon: any, defaultId: string) => {
    if (!pokemon || typeof pokemon !== 'object') {
      console.warn(`⚠️ ポケモンデータが無効: ${JSON.stringify(pokemon)}, デフォルト値を使用`);
      return {
        id: defaultId,
        normalMove: '',
        specialMove1: '',
        specialMove2: ''
      };
    }
    return {
      id: pokemon.id || defaultId,
      normalMove: pokemon.normalMove || '',
      specialMove1: pokemon.specialMove1 || '',
      specialMove2: pokemon.specialMove2 || ''
    };
  };

  const pokemon: Omit<DbPokemon, 'id' | 'party_id' | 'created_at'>[] = [];

  // 安全にポケモンデータを変換
  const safePokemon1 = safeGetPokemon(formParty.pokemon1, '1');
  const safePokemon2 = safeGetPokemon(formParty.pokemon2, '2');
  const safePokemon3 = safeGetPokemon(formParty.pokemon3, '3');

  console.log('🐾 安全なポケモンデータ:', { safePokemon1, safePokemon2, safePokemon3 });

  // 全てのポケモンを登録（技が空でも）
  // ポケモン1の変換
  pokemon.push({
    pokemon_order: 1,
    normal_move: safePokemon1.normalMove || null,
    special_move_1: safePokemon1.specialMove1 || null,
    special_move_2: safePokemon1.specialMove2 || null,
  });

  // ポケモン2の変換
  pokemon.push({
    pokemon_order: 2,
    normal_move: safePokemon2.normalMove || null,
    special_move_1: safePokemon2.specialMove1 || null,
    special_move_2: safePokemon2.specialMove2 || null,
  });

  // ポケモン3の変換
  pokemon.push({
    pokemon_order: 3,
    normal_move: safePokemon3.normalMove || null,
    special_move_1: safePokemon3.specialMove1 || null,
    special_move_2: safePokemon3.specialMove2 || null,
  });

  // カスタムリーグの処理を改善
  // フォームからカスタムリーグ情報を抽出する
  let finalLeague: League = 'その他';
  let customLeague: string | null = null;

  // presetLeagues（既知のリーグ）の定義
  const presetLeagues = [
    'スーパーリーグ', 'ハイパーリーグ', 'マスターリーグ', 'マスタークラシック',
    'プレミアカップ', 'エレメントカップ', 'カントーカップ', 'ジョウトカップ',
    'シンオウカップ', 'ホウエンカップ', 'ガラルカップ', 'アローラカップ',
    '陽光カップ', 'ホリデーカップ', 'ラブカップ', 'リトルカップ',
    'ファンタジーカップ', 'ナイトメアカップ', 'フェアリーカップ',
    'ゴーストカップ', 'ジャングルカップ', 'サンダーカップ', 'クロスカップ',
    'その他'
  ];

  if (formParty.league && presetLeagues.includes(formParty.league)) {
    // プリセットリーグの場合
    finalLeague = formParty.league as League;
    customLeague = null;
  } else {
    // カスタムリーグの場合
    finalLeague = 'その他';
    customLeague = formParty.league || null;
  }

  console.log('🎯 リーグ処理結果:', { 
    originalLeague: formParty.league, 
    finalLeague, 
    customLeague 
  });

  const result = {
    title: formParty.title || null,
    league: finalLeague,
    custom_league: customLeague,
    party_image_url: (formParty.image && formParty.image.trim()) ? formParty.image : null,
    cropped_image_url: (formParty.croppedImage && formParty.croppedImage.trim()) ? formParty.croppedImage : null,
    pokemon,
  };

  console.log('🔄 convertFormToDbInput: 変換結果', {
    result,
    pokemonCount: pokemon.length,
    hasPartyImageUrl: !!result.party_image_url,
    hasCroppedImageUrl: !!result.cropped_image_url,
    partyImageSize: result.party_image_url ? Math.round(result.party_image_url.length / 1024) + 'KB' : 'なし',
    croppedImageSize: result.cropped_image_url ? Math.round(result.cropped_image_url.length / 1024) + 'KB' : 'なし'
  });

  return result;
}

/**
 * データベース形式のPvpPartyDetailを既存のフォーム形式のPvpPartyに変換
 */
export function convertDbToForm(dbParty: PvpPartyDetail): PvpParty {
  // ポケモンデータを順序でソート
  const sortedPokemon = [...dbParty.pokemon].sort((a, b) => a.pokemon_order - b.pokemon_order);

  // 初期化用のポケモンデータ
  const emptyPokemon: Pokemon = {
    id: '',
    normalMove: '',
    specialMove1: '',
    specialMove2: '',
  };

  // ポケモンデータを順序別に配置
  const pokemon1 = sortedPokemon.find(p => p.pokemon_order === 1);
  const pokemon2 = sortedPokemon.find(p => p.pokemon_order === 2);
  const pokemon3 = sortedPokemon.find(p => p.pokemon_order === 3);

  // リーグ情報の処理を改善
  let displayLeague: string;
  
  if (dbParty.league === 'その他' && dbParty.custom_league) {
    // カスタムリーグがある場合はそれを表示
    displayLeague = dbParty.custom_league;
  } else {
    // プリセットリーグの場合はそのまま表示
    displayLeague = dbParty.league;
  }

  console.log('🎯 DB→Form リーグ変換:', { 
    dbLeague: dbParty.league, 
    customLeague: dbParty.custom_league, 
    displayLeague 
  });

  return {
    id: dbParty.id,
    title: dbParty.title || '',
    league: displayLeague,
    pokemon1: pokemon1 ? {
      id: pokemon1.id,
      normalMove: pokemon1.normal_move || '',
      specialMove1: pokemon1.special_move_1 || '',
      specialMove2: pokemon1.special_move_2 || '',
    } : { ...emptyPokemon, id: '1' },
    pokemon2: pokemon2 ? {
      id: pokemon2.id,
      normalMove: pokemon2.normal_move || '',
      specialMove1: pokemon2.special_move_1 || '',
      specialMove2: pokemon2.special_move_2 || '',
    } : { ...emptyPokemon, id: '2' },
    pokemon3: pokemon3 ? {
      id: pokemon3.id,
      normalMove: pokemon3.normal_move || '',
      specialMove1: pokemon3.special_move_1 || '',
      specialMove2: pokemon3.special_move_2 || '',
    } : { ...emptyPokemon, id: '3' },
    image: dbParty.party_image_url || '',
    croppedImage: dbParty.cropped_image_url || '',
    createdAt: new Date(dbParty.created_at),
  };
}

/**
 * パーティの基本検証
 */
export function validatePartyInput(formParty: Omit<PvpParty, 'id' | 'createdAt'>): string[] {
  const errors: string[] = [];

  // リーグの確認
  if (!formParty.league) {
    errors.push('リーグの選択は必須です');
  } else {
    // プリセットリーグの定義（validatePartyInputでも同じリストを使用）
    const presetLeagues = [
      'スーパーリーグ', 'ハイパーリーグ', 'マスターリーグ', 'マスタークラシック',
      'プレミアカップ', 'エレメントカップ', 'カントーカップ', 'ジョウトカップ',
      'シンオウカップ', 'ホウエンカップ', 'ガラルカップ', 'アローラカップ',
      '陽光カップ', 'ホリデーカップ', 'ラブカップ', 'リトルカップ',
      'ファンタジーカップ', 'ナイトメアカップ', 'フェアリーカップ',
      'ゴーストカップ', 'ジャングルカップ', 'サンダーカップ', 'クロスカップ',
      'その他'
    ];

    // カスタムリーグの場合の検証
    if (!presetLeagues.includes(formParty.league)) {
      // カスタムリーグ名が有効な長さかチェック
      if (formParty.league.trim().length === 0) {
        errors.push('カスタムリーグ名を入力してください');
      } else if (formParty.league.trim().length > 100) {
        errors.push('カスタムリーグ名は100文字以内で入力してください');
      }
    }
  }

  // 技のチェックは削除 - 技なしでも登録可能にする
  // const hasValidPokemon = [formParty.pokemon1, formParty.pokemon2, formParty.pokemon3].some(
  //   pokemon => pokemon.normalMove || pokemon.specialMove1 || pokemon.specialMove2
  // );

  // if (!hasValidPokemon) {
  //   errors.push('少なくとも1匹のポケモンにワザを設定してください');
  // }

  return errors;
}

/**
 * レスポンス用の成功メッセージ生成
 */
export function getSuccessMessage(isEdit: boolean): string {
  return isEdit 
    ? 'パーティが正常に更新されました！' 
    : 'パーティが正常に登録されました！';
}

/**
 * エラーメッセージの統一
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'パーティの保存中にエラーが発生しました';
} 