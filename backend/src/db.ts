import Database from 'better-sqlite3';
import path from 'path';

export const db = new Database(path.join(__dirname, '..', 'data.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  preference TEXT DEFAULT '',
  energy INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  shields INTEGER DEFAULT 0,
  shield_fragments INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  onboarding TEXT DEFAULT '',
  plan TEXT DEFAULT '',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS sport_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  multiplier REAL DEFAULT 1.0,
  is_critical INTEGER DEFAULT 0,
  note TEXT DEFAULT '',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at INTEGER DEFAULT (strftime('%s','now')),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS quick_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL,
  partner_id INTEGER,
  sport_type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'open',
  created_at INTEGER DEFAULT (strftime('%s','now')),
  finished_at INTEGER
);

CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  user_a INTEGER NOT NULL,
  user_b INTEGER NOT NULL,
  sport_type TEXT NOT NULL,
  weekdays TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  time_slot TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  streak INTEGER DEFAULT 0,
  fulfilled_days TEXT DEFAULT '[]',
  breached_days TEXT DEFAULT '[]',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS daily_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_id TEXT NOT NULL,
  date TEXT NOT NULL,
  completed INTEGER DEFAULT 0
);
`);

// 字段迁移（兼容老库）
function ensureColumn(table: string, col: string, decl: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
  if (!cols.find(c => c.name === col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${decl}`);
  }
}
ensureColumn('users', 'onboarding', "TEXT DEFAULT ''");
ensureColumn('users', 'plan', "TEXT DEFAULT ''");
