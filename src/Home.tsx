import { useNavigate } from 'react-router-dom';
import { generateGuid } from './utils';
import { BrawlService } from './brawlService';

function Home() {
  const navigate = useNavigate();

  const handleCreateBrawl = () => {
    const brawlId = generateGuid();
    BrawlService.createBrawl(brawlId);
    navigate(`/brawl/${brawlId}`);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', textAlign: 'center' }}>
        🎵 Song Brawl 🎵
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px', textAlign: 'center', maxWidth: '600px' }}>
        Create a brawl room, add your favorite songs, and let the voting decide the winner!
      </p>
      <button
        onClick={handleCreateBrawl}
        style={{
          padding: '15px 30px',
          fontSize: '1.2rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
      >
        Create New Brawl Room
      </button>
    </div>
  );
}

export default Home;
  