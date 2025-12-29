import { useNavigate } from 'react-router-dom';
import { generateGuid } from './utils';
import { BrawlService } from './brawlService';

function Home() {
  const navigate = useNavigate();

  const handleCreateBrawl = async () => {
    const brawlId = generateGuid();
    await BrawlService.createBrawl(brawlId);
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
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 8s ease-in-out infinite reverse',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease-out',
      }}>
        {/* Logo/Icon */}
        <div style={{
          fontSize: '5rem',
          marginBottom: '10px',
          animation: 'float 3s ease-in-out infinite',
        }}>
          🎵
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #fff 0%, #6366f1 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}>
          Song Brawl
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.3rem)',
          marginBottom: '50px',
          maxWidth: '500px',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: 1.7,
        }}>
          Create a brawl room, add your favorite songs, vote with friends, 
          and let the battle decide the ultimate winner!
        </p>

        <button
          onClick={handleCreateBrawl}
          style={{
            padding: '18px 48px',
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
          }}
        >
          🚀 Create New Brawl
        </button>

        {/* Feature badges */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginTop: '60px',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: '🎯', text: 'Vote' },
            { icon: '🔗', text: 'Share' },
            { icon: '🏆', text: 'Win' },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <span>{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
  