import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrawlService } from './brawlService';
import type { Brawl, Song } from './types';
import { generateGuid } from './utils';

function BrawlRoom() {
  const { brawlId } = useParams<{ brawlId: string }>();
  const navigate = useNavigate();
  const [brawl, setBrawl] = useState<Brawl | null>(() => {
    if (!brawlId) return null;
    let currentBrawl = BrawlService.getBrawl(brawlId);
    if (!currentBrawl) {
      currentBrawl = BrawlService.createBrawl(brawlId);
    }
    return currentBrawl;
  });
  const [songName, setSongName] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (!brawlId) {
      navigate('/');
    }
  }, [brawlId, navigate]);

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brawlId || !songName.trim()) return;

    const newSong: Song = {
      id: generateGuid(),
      name: songName.trim(),
      youtubeLink: youtubeLink.trim() || undefined,
      votes: 1, // Each song starts with 1 vote
    };

    const updatedBrawl = BrawlService.addSong(brawlId, newSong);
    if (updatedBrawl) {
      setBrawl(updatedBrawl);
      setSongName('');
      setYoutubeLink('');
    }
  };

  const handleAddVote = (songId: string) => {
    if (!brawlId) return;

    const song = brawl?.songs.find(s => s.id === songId);
    if (!song) return;

    const updatedBrawl = BrawlService.updateSongVotes(brawlId, songId, song.votes + 1);
    if (updatedBrawl) {
      setBrawl(updatedBrawl);
    }
  };

  const handleBrawl = () => {
    if (!brawlId) return;

    const updatedBrawl = BrawlService.selectWinner(brawlId);
    if (updatedBrawl) {
      setBrawl(updatedBrawl);
      setShowWinner(true);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard! Share it with your friends!');
  };

  const handleNewBrawl = () => {
    setShowWinner(false);
    if (brawl) {
      const resetBrawl = { ...brawl, winner: undefined };
      setBrawl(resetBrawl);
    }
  };

  if (!brawl) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      color: 'white',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>🎵 Song Brawl Room</h1>
          <button
            onClick={handleCopyLink}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            📋 Copy Share Link
          </button>
        </div>

        <div style={{
          backgroundColor: '#1e293b',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}>
          <h2 style={{ marginTop: 0 }}>Add a Song</h2>
          <form onSubmit={handleAddSong} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Song Name *
              </label>
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Enter song name"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '1rem',
                  borderRadius: '6px',
                  border: '2px solid #475569',
                  backgroundColor: '#0f172a',
                  color: 'white',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                YouTube Link (optional)
              </label>
              <input
                type="url"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '1rem',
                  borderRadius: '6px',
                  border: '2px solid #475569',
                  backgroundColor: '#0f172a',
                  color: 'white',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '12px',
                fontSize: '1.1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Add Song
            </button>
          </form>
        </div>

        {brawl.songs.length > 0 && (
          <>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
            }}>
              <h2 style={{ marginTop: 0 }}>Songs ({brawl.songs.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {brawl.songs.map((song) => (
                  <div
                    key={song.id}
                    style={{
                      backgroundColor: '#0f172a',
                      padding: '15px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                        {song.name}
                      </div>
                      {song.youtubeLink && (
                        <a
                          href={song.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}
                        >
                          🎬 Watch on YouTube
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        ❤️ {song.votes} {song.votes === 1 ? 'vote' : 'votes'}
                      </span>
                      <button
                        onClick={() => handleAddVote(song.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ec4899',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        + Vote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleBrawl}
                disabled={brawl.songs.length === 0}
                style={{
                  padding: '20px 40px',
                  fontSize: '1.5rem',
                  backgroundColor: brawl.songs.length === 0 ? '#475569' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: brawl.songs.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                }}
              >
                🥊 START BRAWL!
              </button>
            </div>
          </>
        )}

        {brawl.songs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
          }}>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
              No songs added yet. Add your first song to get started!
            </p>
          </div>
        )}

        {showWinner && brawl.winner && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '20px',
            }}>
              <h2 style={{ fontSize: '2.5rem', marginTop: 0, marginBottom: '20px' }}>
                🏆 Winner! 🏆
              </h2>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: '#fbbf24',
              }}>
                {brawl.winner.name}
              </div>
              {brawl.winner.youtubeLink && (
                <a
                  href={brawl.winner.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginBottom: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                  }}
                >
                  🎬 Watch on YouTube
                </a>
              )}
              <div style={{ marginTop: '30px' }}>
                <button
                  onClick={handleNewBrawl}
                  style={{
                    padding: '15px 30px',
                    fontSize: '1.2rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Start New Brawl
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrawlRoom;
