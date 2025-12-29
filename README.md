# 🎵 Song Brawl

A fun TanStack Start application where users can create brawl rooms, add their favorite songs, vote on them, and let randomness decide the winner!

## Features

- **Create Brawl Rooms**: Generate unique shareable rooms with GUIDs
- **Add Songs**: Submit songs with names and optional YouTube links
- **Voting System**: Each song starts with 1 vote, add more to increase winning chances
- **Weighted Random Selection**: The brawl selects a winner based on vote weights
- **Share with Friends**: Copy and share brawl room links to play together
- **Persistent Storage**: Data is stored in SQLite database and survives page refreshes
- **YouTube Integration**: Winner videos are embedded and auto-play in the winner modal
- **Modern UI**: Clean, responsive design with a dark theme

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
npm install
```

### Development

The application uses TanStack Start with server functions and SQLite:

```bash
npm run dev
```

Visit `http://localhost:3001` (or the port shown in the terminal) to start using the app.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## How to Play

1. **Create a Brawl Room**: Click "Create New Brawl Room" on the home page
2. **Add Songs**: Enter song names and optional YouTube links
3. **Vote**: Click the "+ Vote" button on songs to increase their chances
4. **Start the Brawl**: Click "START BRAWL!" to randomly select a winner
5. **Share**: Use the "Copy Share Link" button to invite friends

## Tech Stack

- **React 19**: UI library
- **React Router DOM**: Routing
- **TanStack Query**: Data fetching
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server

## License

MIT
