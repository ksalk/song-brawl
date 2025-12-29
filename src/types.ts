export interface Song {
  id: string;
  name: string;
  youtubeLink?: string;
  votes: number;
}

export interface Brawl {
  id: string;
  songs: Song[];
  winner?: Song;
}
