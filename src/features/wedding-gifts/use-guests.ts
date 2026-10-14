import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

export type Guest = {
  id: number;
  name: string;
  amount: number;
  note: string | null;
  attended: number; // 1 = attended, 0 = absent
  relative_id: number | null; // set when the gift belongs to a relative
};

export type GuestInput = {
  name: string;
  amount: number;
  note: string;
  attended: boolean;
  relativeId: number | null;
};

/** Minimal view of a relative (owned by the relatives module). */
export type RelativeOption = { id: number; name: string };

export function useGuests() {
  const db = useSQLiteContext();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [relatives, setRelatives] = useState<RelativeOption[]>([]);

  const refresh = useCallback(async () => {
    const [g, r] = await Promise.all([
      // linked guests show the relative's current name; the stored name is a fallback
      db.getAllAsync<Guest>(
        `SELECT g.id, COALESCE(r.name, g.name) AS name, g.amount, g.note, g.attended, g.relative_id
         FROM guests g LEFT JOIN relatives r ON r.id = g.relative_id
         ORDER BY g.id DESC`,
      ),
      db.getAllAsync<RelativeOption>(
        'SELECT id, name FROM relatives ORDER BY name COLLATE NOCASE',
      ),
    ]);
    setGuests(g);
    setRelatives(r);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const add = async (g: GuestInput) => {
    await db.runAsync(
      'INSERT INTO guests (name, amount, note, attended, relative_id) VALUES (?, ?, ?, ?, ?)',
      g.name, g.amount, g.note || null, g.attended ? 1 : 0, g.relativeId,
    );
    await refresh();
  };

  const update = async (id: number, g: GuestInput) => {
    await db.runAsync(
      'UPDATE guests SET name = ?, amount = ?, note = ?, attended = ?, relative_id = ? WHERE id = ?',
      g.name, g.amount, g.note || null, g.attended ? 1 : 0, g.relativeId, id,
    );
    await refresh();
  };

  const remove = async (id: number) => {
    await db.runAsync('DELETE FROM guests WHERE id = ?', id);
    await refresh();
  };

  const total = guests.reduce((sum, g) => sum + g.amount, 0);

  return { guests, relatives, total, add, update, remove };
}