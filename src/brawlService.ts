import type { Brawl, Song } from './types';

// In-memory storage for brawl rooms
const brawls = new Map<string, Brawl>();

export const BrawlService = {
  // Create a new brawl room with a GUID
  createBrawl(id: string): Brawl {
    const brawl: Brawl = {
      id,
      songs: [],
    };
    brawls.set(id, brawl);
    return brawl;
  },

  // Get a brawl by ID
  getBrawl(id: string): Brawl | undefined {
    return brawls.get(id);
  },

  // Add a song to a brawl
  addSong(brawlId: string, song: Song): Brawl | undefined {
    const brawl = brawls.get(brawlId);
    if (!brawl) return undefined;
    
    const updatedBrawl = {
      ...brawl,
      songs: [...brawl.songs, song],
    };
    brawls.set(brawlId, updatedBrawl);
    return updatedBrawl;
  },

  // Update votes for a song
  updateSongVotes(brawlId: string, songId: string, votes: number): Brawl | undefined {
    const brawl = brawls.get(brawlId);
    if (!brawl) return undefined;

    const updatedSongs = brawl.songs.map(s => 
      s.id === songId ? { ...s, votes } : s
    );
    
    const updatedBrawl = {
      ...brawl,
      songs: updatedSongs,
    };
    brawls.set(brawlId, updatedBrawl);
    return updatedBrawl;
  },

  // Select a random winner based on votes
  selectWinner(brawlId: string): Brawl | undefined {
    const brawl = brawls.get(brawlId);
    if (!brawl || brawl.songs.length === 0) return undefined;

    // Create a weighted array where each song appears according to its vote count
    const weightedSongs: Song[] = [];
    brawl.songs.forEach(song => {
      for (let i = 0; i < song.votes; i++) {
        weightedSongs.push(song);
      }
    });

    // Select a random song from the weighted array
    if (weightedSongs.length === 0) return brawl;
    
    const randomIndex = Math.floor(Math.random() * weightedSongs.length);
    const updatedBrawl = {
      ...brawl,
      winner: weightedSongs[randomIndex],
    };
    brawls.set(brawlId, updatedBrawl);
    return updatedBrawl;
  },
};
