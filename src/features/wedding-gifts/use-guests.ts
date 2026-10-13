import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

export type Guest = {
  id: number;
  name: string;
  amount: number;
  note: string | null;
  attended: number; // 1 = attended, 0 = absent
};
export type GuestInput = { name: string; amount: number; note: string; attended: boolean };

export function useGuests() {
  const db = useSQLiteContext();
  const [guests, setGuests] = useState<Guest[]>([]);

  const refresh = useCallback(async () => {
    setGuests(
      await db.getAllAsync<Guest>(
        'SELECT id, name, amount, note, attended FROM guests ORDER BY id DESC',
      ),
    );
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (g: GuestInput) => {
    await db.runAsync(
      'INSERT INTO guests (name, amount, note, attended) VALUES (?, ?, ?, ?)',
      g.name, g.amount, g.note || null, g.attended ? 1 : 0,
    );
    await refresh();
  };

  const update = async (id: number, g: GuestInput) => {
    await db.runAsync(
      'UPDATE guests SET name = ?, amount = ?, note = ?, attended = ? WHERE id = ?',
      g.name, g.amount, g.note || null, g.attended ? 1 : 0, id,
    );
    await refresh();
  };

  const remove = async (id: number) => {
    await db.runAsync('DELETE FROM guests WHERE id = ?', id);
    await refresh();
  };

  const total = guests.reduce((sum, g) => sum + g.amount, 0);

  return { guests, total, add, update, remove };
}