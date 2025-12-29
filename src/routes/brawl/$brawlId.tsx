import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { Brawl, Song } from '../../utils/types';
import { BrawlService } from '../../utils/brawlService';
import { generateGuid } from '../../utils/utils';

export const Route = createFileRoute('/brawl/$brawlId')({ component: BrawlRoom })

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function BrawlRoom() {
  const { brawlId } = Route.useParams();
  const navigate = useNavigate();
  const [brawl, setBrawl] = useState<Brawl | null>(null);
  const [loading, setLoading] = useState(true);
  const [songName, setSongName] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [showWinner, setShowWinner] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!brawlId) {
      navigate({ to: '/' });
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
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
    navigate({ to: `/brawl/${newBrawlId}` });
  };

  if (loading || !brawl) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(99, 102, 241, 0.3)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Loading brawl...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      color: 'white',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-100px) rotate(720deg); opacity: 0; } }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem' }}>🎵</span>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              margin: 0,
              background: 'linear-gradient(135deg, #fff, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}>
              Brawl Room
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate({ to: '/' })}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🏠 Home
            </button>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '10px 20px',
                background: copiedLink
                  ? 'linear-gradient(135deg, #10b981, #34d399)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
              }}
            >
              {copiedLink ? '✓ Copied!' : '🔗 Share Link'}
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Left Column: Add Song Form */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.5s ease-out',
          }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '24px',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '1.5rem' }}>➕</span>
              Add a Song
            </h2>
            <form onSubmit={handleAddSong} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
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
                    padding: '14px 16px',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  YouTube Link <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="url"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '14px',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                }}
              >
                Add Song
              </button>
            </form>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '24px',
              marginTop: '24px',
            }}>
              <button
                onClick={handleCreateNewBrawl}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.6)',
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                ✨ Create New Brawl Room
              </button>
            </div>
          </div>

          {/* Right Column: Songs List */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.5s ease-out 0.1s both',
          }}>
            {brawl.songs.length > 0 ? (
              <>
                <h2 style={{
                  marginTop: 0,
                  marginBottom: '24px',
                  fontSize: '1.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎶</span>
                    Songs
                  </span>
                  <span style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    padding: '6px 14px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}>
                    {brawl.songs.length} {brawl.songs.length === 1 ? 'song' : 'songs'}
                  </span>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {brawl.songs.map((song, index) => (
                    <div
                      key={song.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '18px 20px',
                        borderRadius: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        transition: 'all 0.2s ease',
                        animation: `slideUp 0.4s ease-out ${index * 0.05}s both`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          marginBottom: '4px',
                          color: 'white',
                        }}>
                          {song.name}
                        </div>
                        {song.youtubeLink && (
                          <a
                            href={song.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#6366f1',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}
                          >
                            🎬 Watch on YouTube
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#ec4899',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>❤️</span>
                          {song.votes}
                        </span>
                        <button
                          onClick={() => handleAddVote(song.id)}
                          style={{
                            padding: '10px 18px',
                            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(236, 72, 153, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
                          }}
                        >
                          + Vote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Brawl Button */}
                <button
                  onClick={handleBrawl}
                  disabled={brawl.songs.length === 0}
                  style={{
                    width: '100%',
                    padding: '20px 40px',
                    fontSize: '1.4rem',
                    background: brawl.songs.length === 0
                      ? 'rgba(100, 100, 100, 0.3)'
                      : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: brawl.songs.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    boxShadow: brawl.songs.length === 0
                      ? 'none'
                      : '0 8px 30px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={(e) => {
                    if (brawl.songs.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(239, 68, 68, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (brawl.songs.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(239, 68, 68, 0.4)';
                    }
                  }}
                >
                  🥊 START BRAWL!
                </button>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '16px',
                  animation: 'bounce 2s ease-in-out infinite',
                }}>
                  🎵
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>
                  No songs yet
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                }}>
                  Add your first song to get the brawl started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Winner Modal */}
        {showWinner && brawl.winner && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            overflow: 'auto',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <div style={{
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              padding: '48px',
              borderRadius: '24px',
              textAlign: 'center',
              maxWidth: '700px',
              width: '90%',
              margin: '20px',
              position: 'relative',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(251, 191, 36, 0.15)',
              animation: 'slideUp 0.4s ease-out',
            }}>
              <button
                onClick={() => setShowWinner(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '50%',
                  lineHeight: 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
                aria-label="Close"
              >
                ✕
              </button>

              <div style={{
                fontSize: '4rem',
                marginBottom: '16px',
                animation: 'bounce 1s ease-in-out infinite',
              }}>
                🏆
              </div>

              <h2 style={{
                fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
                marginTop: 0,
                marginBottom: '24px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
              }}>
                We Have a Winner!
              </h2>

              <div style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 700,
                marginBottom: '28px',
                color: 'white',
                padding: '16px 24px',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(251, 191, 36, 0.2)',
              }}>
                {brawl.winner.name}
              </div>

              {brawl.winner.youtubeLink && (() => {
                const videoId = getYouTubeVideoId(brawl.winner.youtubeLink);
                return videoId ? (
                  <div style={{
                    marginBottom: '28px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                  }}>
                    <iframe
                      width="100%"
                      height="350"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title={brawl.winner.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ display: 'block' }}
                    ></iframe>
                  </div>
                ) : (
                  <a
                    href={brawl.winner.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginBottom: '28px',
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '50px',
                      fontWeight: 700,
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    🎬 Watch on YouTube
                  </a>
                );
              })()}

              <button
                onClick={handleNewBrawl}
                style={{
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                }}
              >
                🔄 Start New Round
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrawlRoom;
