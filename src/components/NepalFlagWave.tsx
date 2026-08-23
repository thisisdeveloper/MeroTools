import React from 'react';

interface NepalFlagWaveProps {
  className?: string;
}

export const NepalFlagWave: React.FC<NepalFlagWaveProps> = ({ className = 'w-8 h-9' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none overflow-visible ${className}`}>
      <style>{`
        @keyframes nepalFlagFlap {
          0% {
            transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1) rotate(0deg) skewY(0deg);
          }
          20% {
            transform: matrix3d(0.97, 0.05, 0, -0.0008, -0.02, 0.98, 0, 0, 0, 0, 1, 0, 1, -1, 0, 1) rotate(-2.5deg) skewY(3.5deg);
          }
          40% {
            transform: matrix3d(0.95, -0.04, 0, 0.0006, 0.03, 1.02, 0, 0, 0, 0, 1, 0, 2, 1, 0, 1) rotate(2deg) skewY(-2.5deg);
          }
          60% {
            transform: matrix3d(0.98, 0.06, 0, -0.0007, -0.03, 0.97, 0, 0, 0, 0, 1, 0, 1, -0.5, 0, 1) rotate(-3deg) skewY(4deg);
          }
          80% {
            transform: matrix3d(0.96, -0.03, 0, 0.0005, 0.02, 1.01, 0, 0, 0, 0, 1, 0, 1.5, 0.5, 0, 1) rotate(1.5deg) skewY(-1.5deg);
          }
          100% {
            transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1) rotate(0deg) skewY(0deg);
          }
        }

        @keyframes waveRipples {
          0% {
            transform: translateX(-100%);
            opacity: 0.1;
          }
          50% {
            opacity: 0.35;
          }
          100% {
            transform: translateX(120%);
            opacity: 0.05;
          }
        }

        @keyframes tipFlutter {
          0% {
            transform: rotate(0deg) scaleX(1);
          }
          33% {
            transform: rotate(-4deg) scaleX(0.96) translateY(-1px);
          }
          66% {
            transform: rotate(3.5deg) scaleX(1.02) translateY(1.5px);
          }
          100% {
            transform: rotate(0deg) scaleX(1);
          }
        }

        .nepal-flag-body {
          transform-origin: 10px 50px;
          animation: nepalFlagFlap 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          display: block;
        }

        .nepal-flag-tip {
          transform-origin: 40px 50px;
          animation: tipFlutter 1.2s ease-in-out infinite;
        }

        .nepal-wave-shimmer {
          animation: waveRipples 1.5s linear infinite;
        }
      `}</style>

      {/* Flag Canvas SVG with Pole and Fluttering Cloth */}
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Authentic Nepal Crimson Gradient */}
          <linearGradient id="nepalCrimsonGradient" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#E6183C" />
            <stop offset="45%" stopColor="#DC143C" />
            <stop offset="85%" stopColor="#B30E29" />
            <stop offset="100%" stopColor="#8A061B" />
          </linearGradient>

          {/* Deep Royal Blue Border Gradient */}
          <linearGradient id="nepalBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#003893" />
            <stop offset="100%" stopColor="#002266" />
          </linearGradient>

          {/* Wind Ripple Lighting Gradient */}
          <linearGradient id="windShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Clip path matching Nepal's iconic double pennant cloth */}
          <clipPath id="nepalFlagClip">
            <polygon points="10,8 94,54 44,54 84,112 10,112" />
          </clipPath>
        </defs>

        {/* --- FIXED FLAG POLE (Does not flap) --- */}
        <g id="flag-pole">
          {/* Shadow behind pole */}
          <line x1="12" y1="4" x2="12" y2="118" stroke="#000000" strokeWidth="2" strokeOpacity="0.15" />
          {/* Main silver flagpole */}
          <line x1="10" y1="4" x2="10" y2="118" stroke="#CBD5E1" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="9.2" y1="4" x2="9.2" y2="118" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.8" />
          {/* Golden/Brass Finial Topper */}
          <circle cx="10" cy="4" r="3" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <circle cx="9" cy="3" r="1" fill="#FEF3C7" />
          {/* Top & Bottom Attachment Rings */}
          <rect x="7.5" y="8" width="5" height="2" rx="1" fill="#64748B" />
          <rect x="7.5" y="110" width="5" height="2" rx="1" fill="#64748B" />
        </g>

        {/* --- FLUTTERING CLOTH BODY (Continuous GIF-style animation) --- */}
        <g className="nepal-flag-body" id="flag-cloth">
          {/* Outer Border: Royal Blue Nepali Pennant */}
          <polygon
            points="10,8 94,54 44,54 84,112 10,112"
            fill="url(#nepalBlueGradient)"
            stroke="#002B7A"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Field: Crimson Red */}
          <polygon
            points="14,15 80,50 36,50 72,104 14,104"
            fill="url(#nepalCrimsonGradient)"
            stroke="#B30E29"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Upper Pennant Emblem: White Crescent Moon with 8 rays & radiant sun */}
          <g fill="#FFFFFF" transform="translate(26, 32)">
            {/* Crescent moon shape */}
            <path d="M-8,3 A8.5,8.5 0 0,0 8,3 A6.8,6.8 0 0,1 -8,3 Z" />
            {/* Sun inside moon crescent */}
            <circle cx="0" cy="3.5" r="2.2" />
            <path
              d="M0,0.5 L0.8,2.2 L2.6,2.2 L1.2,3.4 L1.8,5.2 L0,4.2 L-1.8,5.2 L-1.2,3.4 L-2.6,2.2 L-0.8,2.2 Z"
              fill="#FFFFFF"
            />
          </g>

          {/* Lower Pennant Emblem: 12-Rayed Radiant White Sun */}
          <g fill="#FFFFFF" transform="translate(28, 77)">
            <circle cx="0" cy="0" r="4.5" />
            {/* 12 Sun Rays */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const radL = ((angle - 11) * Math.PI) / 180;
              const radR = ((angle + 11) * Math.PI) / 180;
              const xTip = Math.cos(rad) * 9.2;
              const yTip = Math.sin(rad) * 9.2;
              const xL = Math.cos(radL) * 4.2;
              const yL = Math.sin(radL) * 4.2;
              const xR = Math.cos(radR) * 4.2;
              const yR = Math.sin(radR) * 4.2;

              return (
                <polygon
                  key={i}
                  points={`${xL},${yL} ${xTip},${yTip} ${xR},${yR}`}
                  fill="#FFFFFF"
                />
              );
            })}
          </g>

          {/* Wind Wave Shimmer Overlay clipped to flag silhouette */}
          <g clipPath="url(#nepalFlagClip)">
            <rect
              className="nepal-wave-shimmer"
              x="0"
              y="0"
              width="100"
              height="120"
              fill="url(#windShine)"
              opacity="0.3"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
