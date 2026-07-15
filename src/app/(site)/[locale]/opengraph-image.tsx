import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CraftsAI - AI Agent Development Studio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0C10',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Signal accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '10px',
            background: '#D8FF3E',
          }}
        />
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: '#EDEEE8',
            marginBottom: '24px',
            letterSpacing: '-2px',
          }}
        >
          Crafts<span style={{ color: '#D8FF3E' }}>AI</span>
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#EDEEE8',
            maxWidth: '900px',
            lineHeight: 1.2,
          }}
        >
          AI Agent Development Studio
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#8A919E',
            marginTop: '28px',
          }}
        >
          Custom AI Agents &bull; Web &bull; Android &bull; iOS
        </div>
      </div>
    ),
    { ...size }
  );
}
