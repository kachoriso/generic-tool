// PvPパーティ Repository - データベースアクセス層

import { query, transaction } from '../database';
import type { PvpParty, Pokemon, PvpPartyInput, PvpPartyDetail, PvpPartyFilter } from '../../types/database';

/**
 * PvPパーティのデータアクセス層
 */
export class PvpPartyRepository {
  /**
   * パーティ一覧を取得
   */
  async findAll(filter?: PvpPartyFilter): Promise<PvpParty[]> {
    let sql = `
      SELECT id, title, league, custom_league, party_image_url, cropped_image_url, 
             created_at, updated_at
      FROM pvp_parties
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    // フィルター条件の追加
    if (filter?.league) {
      conditions.push('league = $' + (params.length + 1));
      params.push(filter.league);
    }

    if (filter?.title) {
      conditions.push('title ILIKE $' + (params.length + 1));
      params.push(`%${filter.title}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    if (filter?.limit) {
      sql += ' LIMIT $' + (params.length + 1);
      params.push(filter.limit);
    }

    const result = await query<PvpParty>(sql, params);
    return result.rows;
  }

  /**
   * パーティ詳細を取得（ポケモン情報含む）
   */
  async findById(id: string): Promise<PvpPartyDetail | null> {
    // パーティ基本情報を取得
    const partyResult = await query<PvpParty>(`
      SELECT id, title, league, custom_league, party_image_url, cropped_image_url,
             created_at, updated_at
      FROM pvp_parties
      WHERE id = $1
    `, [id]);

    if (partyResult.rows.length === 0) {
      return null;
    }

    const party = partyResult.rows[0];

    // パーティに属するポケモン情報を取得
    const pokemonResult = await query<Pokemon>(`
      SELECT id, party_id, pokemon_order, normal_move, special_move_1, special_move_2, created_at
      FROM pokemon
      WHERE party_id = $1
      ORDER BY pokemon_order
    `, [id]);

    return {
      ...party,
      pokemon: pokemonResult.rows
    };
  }

  /**
   * パーティを作成
   */
  async create(partyData: PvpPartyInput): Promise<PvpPartyDetail> {
    return await transaction(async (client) => {
      // パーティを作成
      const partyResult = await client.query(`
        INSERT INTO pvp_parties (title, league, custom_league, party_image_url, cropped_image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, league, custom_league, party_image_url, cropped_image_url, 
                  created_at, updated_at
      `, [
        partyData.title,
        partyData.league,
        partyData.custom_league,
        partyData.party_image_url,
        partyData.cropped_image_url
      ]);

      const party = partyResult.rows[0];
      const pokemon: Pokemon[] = [];

      // ポケモン情報を作成
      if (partyData.pokemon && partyData.pokemon.length > 0) {
        for (const pokemonData of partyData.pokemon) {
          const pokemonResult = await client.query(`
            INSERT INTO pokemon (party_id, pokemon_order, normal_move, special_move_1, special_move_2)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, party_id, pokemon_order, normal_move, special_move_1, special_move_2, created_at
          `, [
            party.id,
            pokemonData.pokemon_order,
            pokemonData.normal_move,
            pokemonData.special_move_1,
            pokemonData.special_move_2
          ]);

          pokemon.push(pokemonResult.rows[0]);
        }
      }

      return {
        ...party,
        pokemon
      };
    });
  }

  /**
   * パーティを更新
   */
  async update(id: string, partyData: Partial<PvpPartyInput>): Promise<PvpPartyDetail | null> {
    return await transaction(async (client) => {
      // パーティの存在確認
      const existingParty = await client.query('SELECT id FROM pvp_parties WHERE id = $1', [id]);
      if (existingParty.rows.length === 0) {
        return null;
      }

      // パーティ情報を更新
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 1;

      if (partyData.title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        updateValues.push(partyData.title);
      }
      if (partyData.league !== undefined) {
        updateFields.push(`league = $${paramCount++}`);
        updateValues.push(partyData.league);
      }
      if (partyData.custom_league !== undefined) {
        updateFields.push(`custom_league = $${paramCount++}`);
        updateValues.push(partyData.custom_league);
      }
      if (partyData.party_image_url !== undefined) {
        updateFields.push(`party_image_url = $${paramCount++}`);
        updateValues.push(partyData.party_image_url);
      }
      if (partyData.cropped_image_url !== undefined) {
        updateFields.push(`cropped_image_url = $${paramCount++}`);
        updateValues.push(partyData.cropped_image_url);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        const updateSql = `
          UPDATE pvp_parties 
          SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramCount}
          RETURNING id, title, league, custom_league, party_image_url, cropped_image_url,
                    created_at, updated_at
        `;
        
        const partyResult = await client.query(updateSql, updateValues);
        const party = partyResult.rows[0];

        // ポケモン情報の更新
        if (partyData.pokemon) {
          // 既存のポケモンを削除
          await client.query('DELETE FROM pokemon WHERE party_id = $1', [id]);

          // 新しいポケモン情報を挿入
          const pokemon: Pokemon[] = [];
          for (const pokemonData of partyData.pokemon) {
            const pokemonResult = await client.query(`
              INSERT INTO pokemon (party_id, pokemon_order, normal_move, special_move_1, special_move_2)
              VALUES ($1, $2, $3, $4, $5)
              RETURNING id, party_id, pokemon_order, normal_move, special_move_1, special_move_2, created_at
            `, [
              id,
              pokemonData.pokemon_order,
              pokemonData.normal_move,
              pokemonData.special_move_1,
              pokemonData.special_move_2
            ]);

            pokemon.push(pokemonResult.rows[0]);
          }

          return {
            ...party,
            pokemon
          };
        } else {
          // ポケモン情報は変更しない場合、既存のポケモン情報を取得
          const pokemonResult = await client.query(`
            SELECT id, party_id, pokemon_order, normal_move, special_move_1, special_move_2, created_at
            FROM pokemon
            WHERE party_id = $1
            ORDER BY pokemon_order
          `, [id]);

          return {
            ...party,
            pokemon: pokemonResult.rows
          };
        }
      } else {
        // 更新フィールドがない場合、現在の情報を返す
        return await this.findById(id);
      }
    });
  }

  /**
   * パーティを削除
   */
  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM pvp_parties WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * パーティ数を取得
   */
  async count(filter?: PvpPartyFilter): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM pvp_parties';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filter?.league) {
      conditions.push('league = $' + (params.length + 1));
      params.push(filter.league);
    }

    if (filter?.title) {
      conditions.push('title ILIKE $' + (params.length + 1));
      params.push(`%${filter.title}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query<{ count: string }>(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * リーグ別統計を取得
   */
  async getLeagueStats(): Promise<{ league: string; count: number }[]> {
    const result = await query<{ league: string; count: string }>(`
      SELECT league, COUNT(*) as count
      FROM pvp_parties
      GROUP BY league
      ORDER BY count DESC
    `);

    return result.rows.map(row => ({
      league: row.league,
      count: parseInt(row.count, 10)
    }));
  }
} 