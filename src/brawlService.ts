import type { Brawl, Song } from './types';

const API_URL = 'http://localhost:3001/api';

export const BrawlService = {
  // Create a new brawl room with a GUID
  async createBrawl(id: string): Promise<Brawl> {
    const response = await fetch(`${API_URL}/brawls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return response.json();
  },

  // Get a brawl by ID
  async getBrawl(id: string): Promise<Brawl | undefined> {
    const response = await fetch(`${API_URL}/brawls/${id}`);
    const data = await response.json();
    return data.songs || data.songs.length > 0 || data.winner ? data : undefined;
  },

  // Add a song to a brawl
  async addSong(brawlId: string, song: Song): Promise<Brawl | undefined> {
    const response = await fetch(`${API_URL}/brawls/${brawlId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song),
    });
    return response.json();
  },

  // Update votes for a song
  async updateSongVotes(brawlId: string, songId: string, votes: number): Promise<Brawl | undefined> {
    const response = await fetch(`${API_URL}/brawls/${brawlId}/songs/${songId}/votes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ votes }),
    });
    return response.json();
  },

  // Select a random winner based on votes
  async selectWinner(brawlId: string): Promise<Brawl | undefined> {
    // First get the brawl to calculate winner client-side
    const brawl = await this.getBrawl(brawlId);
    if (!brawl || brawl.songs.length === 0) return undefined;

    // Create a weighted array where each song appears according to its vote count
    // Note: This approach is O(total_votes) in memory but simple and works well
    // for typical use cases (dozens to hundreds of votes per song)
    const weightedSongs: Song[] = [];
    brawl.songs.forEach(song => {
      for (let i = 0; i < song.votes; i++) {
        weightedSongs.push(song);
      }
    });

    // Select a random song from the weighted array
    if (weightedSongs.length === 0) return brawl;
    
    const randomIndex = Math.floor(Math.random() * weightedSongs.length);
    const winner = weightedSongs[randomIndex];

    // Save the winner to the database
    const response = await fetch(`${API_URL}/brawls/${brawlId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId: winner.id }),
    });
    return response.json();
  },
};
