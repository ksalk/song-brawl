import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Database types
interface BrawlRow {
  id: string;
  winner_id: string | null;
}

interface SongRow {
  id: string;
  brawl_id: string;
  name: string;
  youtube_link: string | null;
  votes: number;
}

// Initialize SQLite database
const dbPath = path.join(__dirname, 'brawl.db');
const db = new Database(dbPath);

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

// Get a brawl with all its songs
app.get('/api/brawls/:id', (req, res) => {
  const { id } = req.params;
  
  const brawl = db.prepare('SELECT * FROM brawls WHERE id = ?').get(id) as BrawlRow | undefined;
  if (!brawl) {
    return res.json({ id, songs: [], winner: null });
  }

  const songs = db.prepare('SELECT * FROM songs WHERE brawl_id = ?').all(id) as SongRow[];
  
  let winner = null;
  if (brawl.winner_id) {
    winner = db.prepare('SELECT * FROM songs WHERE id = ?').get(brawl.winner_id) as SongRow | undefined;
  }

  res.json({
    id: brawl.id,
    songs: songs.map((s) => ({
      id: s.id,
      name: s.name,
      youtubeLink: s.youtube_link,
      votes: s.votes,
    })),
    winner: winner ? {
      id: winner.id,
      name: winner.name,
      youtubeLink: winner.youtube_link,
      votes: winner.votes,
    } : undefined,
  });
});

// Create a new brawl
app.post('/api/brawls', (req, res) => {
  const { id } = req.body;
  
  try {
    db.prepare('INSERT INTO brawls (id) VALUES (?)').run(id);
    res.json({ id, songs: [] });
  } catch {
    // If brawl already exists, just return it
    const brawl = db.prepare('SELECT * FROM brawls WHERE id = ?').get(id) as BrawlRow;
    const songs = db.prepare('SELECT * FROM songs WHERE brawl_id = ?').all(id) as SongRow[];
    
    res.json({
      id: brawl.id,
      songs: songs.map((s) => ({
        id: s.id,
        name: s.name,
        youtubeLink: s.youtube_link,
        votes: s.votes,
      })),
    });
  }
});

// Add a song to a brawl
app.post('/api/brawls/:brawlId/songs', (req, res) => {
  const { brawlId } = req.params;
  const { id, name, youtubeLink } = req.body;

  db.prepare(
    'INSERT INTO songs (id, brawl_id, name, youtube_link, votes) VALUES (?, ?, ?, ?, 1)'
  ).run(id, brawlId, name, youtubeLink || null);

  const songs = db.prepare('SELECT * FROM songs WHERE brawl_id = ?').all(brawlId) as SongRow[];
  
  res.json({
    id: brawlId,
    songs: songs.map((s) => ({
      id: s.id,
      name: s.name,
      youtubeLink: s.youtube_link,
      votes: s.votes,
    })),
  });
});

// Update song votes
app.put('/api/brawls/:brawlId/songs/:songId/votes', (req, res) => {
  const { brawlId, songId } = req.params;
  const { votes } = req.body;

  db.prepare('UPDATE songs SET votes = ? WHERE id = ? AND brawl_id = ?').run(
    votes,
    songId,
    brawlId
  );

  const songs = db.prepare('SELECT * FROM songs WHERE brawl_id = ?').all(brawlId) as SongRow[];
  
  res.json({
    id: brawlId,
    songs: songs.map((s) => ({
      id: s.id,
      name: s.name,
      youtubeLink: s.youtube_link,
      votes: s.votes,
    })),
  });
});

// Select a winner
app.post('/api/brawls/:brawlId/winner', (req, res) => {
  const { brawlId } = req.params;
  const { winnerId } = req.body;

  db.prepare('UPDATE brawls SET winner_id = ? WHERE id = ?').run(winnerId, brawlId);

  const brawl = db.prepare('SELECT * FROM brawls WHERE id = ?').get(brawlId) as BrawlRow;
  const songs = db.prepare('SELECT * FROM songs WHERE brawl_id = ?').all(brawlId) as SongRow[];
  const winner = db.prepare('SELECT * FROM songs WHERE id = ?').get(winnerId) as SongRow;

  res.json({
    id: brawl.id,
    songs: songs.map((s) => ({
      id: s.id,
      name: s.name,
      youtubeLink: s.youtube_link,
      votes: s.votes,
    })),
    winner: {
      id: winner.id,
      name: winner.name,
      youtubeLink: winner.youtube_link,
      votes: winner.votes,
    },
  });
});

app.listen(PORT, () => {
  console.log(`🎵 Song Brawl API server running on http://localhost:${PORT}`);
});
