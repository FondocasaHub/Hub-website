import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { trackLeadGenerated } from './utils/trackingEvents';

export default function GraziePage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, CREAM } = colors;

  useEffect(() => {
    window.scrollTo(0, 0);
    trackLeadGenerated('zero_vincoli_60');
  }, []);

  return (
    <>
      <Helmet>
        <title>Richiesta Ricevuta | HUB Napoli</title>
        <meta name="description" content="Grazie per la tua richiesta. Ti ricontatteremo entro 24 ore." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        background: '#0a1628',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          animation: 'fadeIn 0.6s ease-in',
        }}>
          {/* Checkmark Icon */}
          <div style={{
            fontSize: '80px',
            marginBottom: '30px',
            animation: 'scaleIn 0.6s ease-out',
          }}>
            ✓
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 700,
            color: '#c9a84c',
            marginBottom: '20px',
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '-0.5px',
          }}>
            Richiesta ricevuta!
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: '#ffffff',
            lineHeight: 1.8,
            marginBottom: '50px',
            fontWeight: 300,
            opacity: 0.95,
          }}>
            Ti ricontatteremo entro 24 ore.<br />
            Controlla anche la tua email.
          </p>

          {/* Back to Home Button */}
          <button
            onClick={() => navigate('home')}
            style={{
              padding: '16px 48px',
              background: '#c9a84c',
              color: '#0a1628',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d9b860';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#c9a84c';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Torna alla Home
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
