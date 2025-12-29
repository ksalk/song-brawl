import { createServerFn } from '@tanstack/react-start'
import type { Brawl, Song } from '../utils/types';

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

async function getDb() {
  const { db } = await import('./db');
  return db;
}

export const getBrawl = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const db = await getDb();
    const brawl = db.prepare('SELECT * FROM brawls WHERE id = ?').get(id) as BrawlRow | undefined;
    if (!brawl) {
      return { id, songs: [], winner: undefined } as Brawl;
    }

    const songs = db.prepare('SELECT * FROM songs WHERE brawl_id = ?').all(id) as SongRow[];
    
    let winner = undefined;
    if (brawl.winner_id) {
      const winnerRow = db.prepare('SELECT * FROM songs WHERE id = ?').get(brawl.winner_id) as SongRow | undefined;
      if (winnerRow) {
        winner = {
          id: winnerRow.id,
          name: winnerRow.name,
          youtubeLink: winnerRow.youtube_link || undefined,
          votes: winnerRow.votes,
        };
      }
    }

    return {
      id: brawl.id,
      songs: songs.map((s) => ({
        id: s.id,
        name: s.name,
        youtubeLink: s.youtube_link || undefined,
        votes: s.votes,
      })),
      winner,
    } as Brawl;
  });

export const createBrawl = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const db = await getDb();
    try {
      db.prepare('INSERT INTO brawls (id) VALUES (?)').run(id);
      return { id, songs: [] } as Brawl;
    } catch {
      // If brawl already exists, just return it
      return getBrawl({ data: id });
    }
  });

export const addSong = createServerFn({ method: 'POST' })
  .inputValidator((data: { brawlId: string; song: Omit<Song, 'votes'> }) => data)
  .handler(async ({ data: { brawlId, song } }) => {
    const db = await getDb();
    db.prepare(
      'INSERT INTO songs (id, brawl_id, name, youtube_link, votes) VALUES (?, ?, ?, ?, 1)'
    ).run(song.id, brawlId, song.name, song.youtubeLink || null);

    return getBrawl({ data: brawlId });
  });

export const updateVotes = createServerFn({ method: 'POST' })
  .inputValidator((data: { brawlId: string; songId: string; votes: number }) => data)
  .handler(async ({ data: { brawlId, songId, votes } }) => {
    const db = await getDb();
    db.prepare('UPDATE songs SET votes = ? WHERE id = ? AND brawl_id = ?').run(
      votes,
      songId,
      brawlId
    );

    return getBrawl({ data: brawlId });
  });

export const setWinner = createServerFn({ method: 'POST' })
  .inputValidator((data: { brawlId: string; winnerId: string }) => data)
  .handler(async ({ data: { brawlId, winnerId } }) => {
    const db = await getDb();
    db.prepare('UPDATE brawls SET winner_id = ? WHERE id = ?').run(winnerId, brawlId);
    return getBrawl({ data: brawlId });
  });