import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(__dirname, 'brawl.db');
export const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS brawls (
    id TEXT PRIMARY KEY,
    winner_id TEXT
  );

  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    brawl_id TEXT NOT NULL,
    name TEXT NOT NULL,
    youtube_link TEXT,
    votes INTEGER DEFAULT 1,
    FOREIGN KEY (brawl_id) REFERENCES brawls(id) ON DELETE CASCADE
  );
`);
