import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrawlService } from './brawlService';
import type { Brawl, Song } from './types';
import { generateGuid } from './utils';

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function BrawlRoom() {
  const { brawlId } = useParams<{ brawlId: string }>();
  const navigate = useNavigate();
  const [brawl, setBrawl] = useState<Brawl | null>(null);
  const [loading, setLoading] = useState(true);
  const [songName, setSongName] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (!brawlId) {
      navigate('/');
      return;
    }

    // Load brawl from database
    const loadBrawl = async () => {
      try {
        let currentBrawl = await BrawlService.getBrawl(brawlId);
        if (!currentBrawl) {
          currentBrawl = await BrawlService.createBrawl(brawlId);
        }
        setBrawl(currentBrawl);
      } catch (error) {
        console.error('Error loading brawl:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrawl();
  }, [brawlId, navigate]);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brawlId || !songName.trim()) return;

    const newSong: Song = {
      id: generateGuid(),
      name: songName.trim(),
      youtubeLink: youtubeLink.trim() || undefined,
      votes: 1, // Each song starts with 1 vote
    };

    try {
      const updatedBrawl = await BrawlService.addSong(brawlId, newSong);
      if (updatedBrawl) {
        setBrawl(updatedBrawl);
        setSongName('');
        setYoutubeLink('');
      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const handleAddVote = async (songId: string) => {
    if (!brawlId) return;

    const song = brawl?.songs.find(s => s.id === songId);
    if (!song) return;

    try {
      const updatedBrawl = await BrawlService.updateSongVotes(brawlId, songId, song.votes + 1);
      if (updatedBrawl) {
        setBrawl(updatedBrawl);
      }
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  const handleBrawl = async () => {
    if (!brawlId) return;

    try {
      const updatedBrawl = await BrawlService.selectWinner(brawlId);
      if (updatedBrawl) {
        setBrawl(updatedBrawl);
        setShowWinner(true);
      }
    } catch (error) {
      console.error('Error selecting winner:', error);
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

  const handleCreateNewBrawl = async () => {
    const newBrawlId = generateGuid();
    await BrawlService.createBrawl(newBrawlId);
    navigate(`/brawl/${newBrawlId}`);
  };

  if (loading || !brawl) {
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
      <div>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>🎵 Song Brawl Room</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              🏠 Home
            </button>
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
        </div>

        <div style={{
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }}>
          {/* Left Column: Add Song Form & Create New Brawl Button */}
          <div style={{
            flex: '1',
            minWidth: '300px',
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
          }}>
            <h2 style={{ marginTop: 0 }}>Add a Song</h2>
            <form onSubmit={handleAddSong} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
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
                    boxSizing: 'border-box',
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
                    boxSizing: 'border-box',
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

            <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', marginTop: '20px' }}>
              <button
                onClick={handleCreateNewBrawl}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px dashed #475569',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.borderColor = '#475569';
                }}
              >
                ➕ Create a Brand New Brawl Room
              </button>
            </div>
          </div>

          {/* Right Column: Added Songs List */}
          <div style={{
            flex: '2',
            minWidth: '300px',
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
          }}>
            {brawl.songs.length > 0 ? (
              <>
                <h2 style={{ marginTop: 0 }}>Songs ({brawl.songs.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
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

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
                      width: '100%',
                    }}
                  >
                    🥊 START BRAWL!
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                marginBottom: '30px',
              }}>
                <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                  No songs added yet. Add your first song to get started!
                </p>
              </div>
            )}
          </div>
        </div>

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
            overflow: 'auto',
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '800px',
              width: '90%',
              margin: '20px',
              position: 'relative',
            }}>
              <button
                onClick={() => setShowWinner(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '5px',
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ✕
              </button>
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
              {brawl.winner.youtubeLink && (() => {
                const videoId = getYouTubeVideoId(brawl.winner.youtubeLink);
                return videoId ? (
                  <div style={{ marginBottom: '20px' }}>
                    <iframe
                      width="100%"
                      height="400"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title={brawl.winner.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        borderRadius: '8px',
                        maxWidth: '640px',
                      }}
                    ></iframe>
                  </div>
                ) : (
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
                );
              })()}
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
