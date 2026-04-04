import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CraftsAI - AI-Powered Development Studio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '20px',
          }}
        >
          CraftsAI
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          AI-Powered Development Studio
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#64748b',
            marginTop: '20px',
          }}
        >
          Web &bull; Android &bull; iOS &bull; 10x Faster
        </div>
      </div>
    ),
    { ...size }
  );
}
