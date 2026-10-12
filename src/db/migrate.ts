import type { SQLiteDatabase } from 'expo-sqlite';

const LATEST_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= LATEST_VERSION) return;

  if (version === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        note TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
    `);
    version = 1;
  }
  // if (version === 1) { ...next module's tables...; version = 2; }

  await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
}