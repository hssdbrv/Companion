import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import type { RelationType, Sex } from './format';

export type Relative = {
  id: number;
  name: string; // full name, kept in sync as "first last"
  first_name: string;
  last_name: string;
  birth_year: number | null;
  deceased: number; // 1 = passed away
  sex: Sex | null;
  is_head: number; // 1 = head of the family
};

export type Relation = { id: number; a_id: number; b_id: number; type: RelationType };

/** Read-only view of a relative's wedding gift record (owned by the wedding module). */
export type WeddingInfo = { amount: number; attended: number; note: string | null };

export type RelativeInput = {
  firstName: string;
  lastName: string;
  birthYear: number | null;
  deceased: boolean;
  sex: Sex | null;
  isHead: boolean;
};

const fullName = (g: Pick<RelativeInput, 'firstName' | 'lastName'>) =>
  `${g.firstName} ${g.lastName}`.trim();

export function useRelatives() {
  const db = useSQLiteContext();
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [wedding, setWedding] = useState<Record<number, WeddingInfo>>({});
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [people, links, gifts] = await Promise.all([
      db.getAllAsync<Relative>(
        'SELECT id, name, first_name, last_name, birth_year, deceased, sex, is_head FROM relatives ORDER BY name COLLATE NOCASE',
      ),
      db.getAllAsync<Relation>('SELECT id, a_id, b_id, type FROM relations'),
      db.getAllAsync<WeddingInfo & { relative_id: number }>(
        'SELECT relative_id, amount, attended, note FROM guests WHERE relative_id IS NOT NULL',
      ),
    ]);
    const byRelative: Record<number, WeddingInfo> = {};
    for (const g of gifts) {
      byRelative[g.relative_id] = { amount: g.amount, attended: g.attended, note: g.note };
    }
    setRelatives(people);
    setRelations(links);
    setWedding(byRelative);
    setLoaded(true);
  }, [db]);

  // reload whenever the screen gains focus (e.g. coming back from a detail page)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  /** Inserts a relative and returns the new id. */
  const addRelative = async (g: RelativeInput): Promise<number> => {
    const res = await db.runAsync(
      'INSERT INTO relatives (name, first_name, last_name, birth_year, deceased, sex, is_head) VALUES (?, ?, ?, ?, ?, ?, ?)',
      fullName(g), g.firstName, g.lastName, g.birthYear, g.deceased ? 1 : 0, g.sex, g.isHead ? 1 : 0,
    );
    await refresh();
    return res.lastInsertRowId;
  };

  const updateRelative = async (id: number, g: RelativeInput) => {
    await db.runAsync(
      'UPDATE relatives SET name = ?, first_name = ?, last_name = ?, birth_year = ?, deceased = ?, sex = ?, is_head = ? WHERE id = ?',
      fullName(g), g.firstName, g.lastName, g.birthYear, g.deceased ? 1 : 0, g.sex, g.isHead ? 1 : 0, id,
    );
    await refresh();
  };

  const removeRelative = async (id: number) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM relations WHERE a_id = ? OR b_id = ?', id, id);
      // the wedding gift record stays, as a plain guest
      await db.runAsync('UPDATE guests SET relative_id = NULL WHERE relative_id = ?', id);
      await db.runAsync('DELETE FROM relatives WHERE id = ?', id);
    });
    await refresh();
  };

  const addRelation = async (aId: number, bId: number, type: RelationType) => {
    if (aId === bId) return;
    // symmetric types are stored once, smaller id first
    const [a, b] = type !== 'parent' && aId > bId ? [bId, aId] : [aId, bId];
    await db.runAsync('INSERT OR IGNORE INTO relations (a_id, b_id, type) VALUES (?, ?, ?)', a, b, type);
    await refresh();
  };

  const removeRelation = async (id: number) => {
    await db.runAsync('DELETE FROM relations WHERE id = ?', id);
    await refresh();
  };

  return {
    relatives,
    relations,
    wedding,
    loaded,
    addRelative,
    updateRelative,
    removeRelative,
    addRelation,
    removeRelation,
  };
}