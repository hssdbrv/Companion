import type { SQLiteDatabase } from 'expo-sqlite';

const LATEST_VERSION = 6;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= LATEST_VERSION) return;

  // v1: wedding gifts
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

  // v2: attendance for wedding guests
  if (version === 1) {
    await db.execAsync(
      'ALTER TABLE guests ADD COLUMN attended INTEGER NOT NULL DEFAULT 1;',
    );
    version = 2;
  }

  // v3: relatives + relationships (independent of the wedding module)
  if (version === 2) {
    await db.execAsync(`
      CREATE TABLE relatives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birth_year INTEGER,
        deceased INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE relations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        a_id INTEGER NOT NULL,
        b_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        UNIQUE (a_id, b_id, type)
      );
    `);
    version = 3;
  }

  // v4: a wedding gift record can point at a relative (one record per relative)
  if (version === 3) {
    await db.execAsync(`
      ALTER TABLE guests ADD COLUMN relative_id INTEGER REFERENCES relatives(id);
      CREATE UNIQUE INDEX idx_guests_relative ON guests(relative_id) WHERE relative_id IS NOT NULL;
    `);
    version = 4;
  }

  // v5: sex and head-of-family flag for relatives
  if (version === 4) {
    await db.execAsync(`
      ALTER TABLE relatives ADD COLUMN sex TEXT;
      ALTER TABLE relatives ADD COLUMN is_head INTEGER NOT NULL DEFAULT 0;
    `);
    version = 5;
  }

  // v6: separate first / last name (`name` stays as the full name)
  if (version === 5) {
    await db.execAsync(`
      ALTER TABLE relatives ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
      ALTER TABLE relatives ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
      UPDATE relatives SET
        first_name = CASE WHEN instr(name, ' ') > 0
          THEN substr(name, 1, instr(name, ' ') - 1) ELSE name END,
        last_name = CASE WHEN instr(name, ' ') > 0
          THEN trim(substr(name, instr(name, ' ') + 1)) ELSE '' END;
    `);
    version = 6;
  }

  await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
}