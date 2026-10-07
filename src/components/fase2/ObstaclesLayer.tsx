import React from 'react';
import { RunnerObstacle, RunnerCollectible } from '../../types';

interface ObstaclesLayerProps {
  obstacles: RunnerObstacle[];
  collectibles: RunnerCollectible[];
}

export const ObstaclesLayer: React.FC<ObstaclesLayerProps> = ({
  obstacles,
  collectibles,
}) => {
  const renderObstacleVisual = (obs: RunnerObstacle) => {
    switch (obs.kind) {
      case 'bucket':
        return (
          <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow">
            {/* Blue Bucket with soapy water and bubbles */}
            <polygon points="10,12 40,12 35,46 15,46" fill="#0284c7" stroke="#0369a1" strokeWidth="2.5" />
            <ellipse cx="25" cy="12" rx="15" ry="5" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
            {/* White bubbles overflowing */}
            <circle cx="20" cy="8" r="5" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.5" />
            <circle cx="28" cy="7" r="6" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.5" />
            <circle cx="34" cy="10" r="4" fill="#ffffff" stroke="#bae6fd" strokeWidth="1" />
            {/* Handle */}
            <path d="M 8 16 Q 25 -4 42 16" fill="none" stroke="#64748b" strokeWidth="2" />
          </svg>
        );

      case 'soap_slip':
        return (
          <svg viewBox="0 0 50 35" className="w-full h-full drop-shadow">
            {/* Slippery soap bar with glistening speed marks */}
            <rect x="6" y="10" width="38" height="20" rx="9" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
            <ellipse cx="22" cy="16" rx="10" ry="3" fill="#fbcfe8" opacity="0.8" />
            {/* Slip marks */}
            <path d="M 4 32 Q 25 30 46 32" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
            <circle cx="44" cy="8" r="3" fill="#ffffff" />
          </svg>
        );

      case 'puddle':
        return (
          <svg viewBox="0 0 60 30" className="w-full h-full drop-shadow">
            {/* Soapy water puddle */}
            <ellipse cx="30" cy="18" rx="28" ry="10" fill="#38bdf8" opacity="0.85" stroke="#0284c7" strokeWidth="1.5" />
            <ellipse cx="24" cy="16" rx="16" ry="5" fill="#7dd3fc" opacity="0.9" />
            {/* Small bubbles */}
            <circle cx="18" cy="14" r="2.5" fill="#ffffff" />
            <circle cx="36" cy="16" r="3" fill="#ffffff" />
          </svg>
        );

      case 'mud_puddle':
        return (
          <svg viewBox="0 0 64 34" className="w-full h-full drop-shadow animate-pulse">
            {/* Rich brown mud puddle that restores dirt! */}
            <ellipse cx="32" cy="20" rx="30" ry="11" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <ellipse cx="26" cy="18" rx="20" ry="7" fill="#92400e" opacity="0.9" />
            {/* Mud splatters & steam */}
            <circle cx="14" cy="12" r="3" fill="#78350f" />
            <circle cx="48" cy="10" r="3.5" fill="#78350f" />
            <ellipse cx="38" cy="21" rx="4" ry="2" fill="#b45309" />
            <text x="12" y="8" fontSize="8" fontWeight="900" fill="#fef08a">LAMA! 💩</text>
          </svg>
        );

      case 'duck':
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow">
            {/* Rubber duck on floor */}
            <ellipse cx="20" cy="28" rx="16" ry="12" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="28" cy="16" r="10" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            <polygon points="36,16 44,19 36,22" fill="#f97316" />
            <circle cx="30" cy="14" r="2" fill="#000" />
            <circle cx="29" cy="13" r="0.8" fill="#fff" />
          </svg>
        );

      case 'box':
        return (
          <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow">
            {/* Cardboard box */}
            <rect x="6" y="10" width="38" height="36" rx="4" fill="#d97706" stroke="#92400e" strokeWidth="2" />
            <line x1="6" y1="20" x2="44" y2="20" stroke="#b45309" strokeWidth="2" />
            <line x1="25" y1="20" x2="25" y2="46" stroke="#b45309" strokeWidth="2" />
            {/* Tape */}
            <rect x="21" y="8" width="8" height="14" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
          </svg>
        );

      case 'laundry_basket':
        return (
          <svg viewBox="0 0 55 50" className="w-full h-full drop-shadow">
            {/* Laundry basket with colorful clothes */}
            <polygon points="8,16 47,16 41,46 14,46" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
            <ellipse cx="27" cy="16" rx="19" ry="6" fill="#c084fc" />
            {/* Clothes sticking out */}
            <path d="M 16 14 Q 22 4 30 14" fill="#f43f5e" />
            <path d="M 28 14 Q 36 6 42 14" fill="#38bdf8" />
          </svg>
        );

      case 'towel_hanging':
        return (
          <svg viewBox="0 0 55 60" className="w-full h-full drop-shadow">
            {/* Hanging towel from above (Must duck!) */}
            <line x1="0" y1="6" x2="55" y2="6" stroke="#64748b" strokeWidth="3" />
            <rect x="10" y="6" width="35" height="48" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <line x1="10" y1="46" x2="45" y2="46" stroke="#fbbf24" strokeWidth="4" />
            <line x1="10" y1="51" x2="45" y2="51" stroke="#fef3c7" strokeWidth="2" />
            {/* Clothes pins */}
            <rect x="14" y="2" width="4" height="8" fill="#ef4444" />
            <rect x="36" y="2" width="4" height="8" fill="#ef4444" />
            <text x="16" y="60" fontSize="9" fontWeight="bold" fill="#dc2626">ABAIXE! ⬇️</text>
          </svg>
        );

      case 'flying_sponge':
        return (
          <svg viewBox="0 0 50 40" className="w-full h-full drop-shadow animate-pulse">
            {/* Flying Soapy Sponge overhead (Must duck!) */}
            <rect x="8" y="10" width="34" height="22" rx="6" fill="#84cc16" stroke="#4d7c0f" strokeWidth="2" transform="rotate(-10 25 20)" />
            <circle cx="16" cy="18" r="3" fill="#65a30d" />
            <circle cx="28" cy="22" r="3.5" fill="#65a30d" />
            {/* Flying bubbles */}
            <circle cx="4" cy="12" r="3" fill="#ffffff" />
            <circle cx="44" cy="8" r="4" fill="#ffffff" />
            <text x="6" y="38" fontSize="9" fontWeight="bold" fill="#dc2626">CUIDADO!</text>
          </svg>
        );

      case 'shower_hose':
        return (
          <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
            {/* Shower hose arc with water jets */}
            <path d="M 0 10 Q 30 2 60 14" fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
            {/* Water drops spraying downwards */}
            <path d="M 15 15 L 12 28 M 30 12 L 28 32 M 45 16 L 44 30" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <text x="10" y="44" fontSize="9" fontWeight="bold" fill="#dc2626">ABAIXE! ⬇️</text>
          </svg>
        );
    }
  };

  const renderCollectibleVisual = (col: RunnerCollectible) => {
    switch (col.kind) {
      case 'rubber_duck':
        return (
          <div className="w-full h-full flex items-center justify-center animate-bounce">
            <span className="text-2xl filter drop-shadow">🦆</span>
          </div>
        );
      case 'gold_soap':
        return (
          <div className="w-full h-full flex items-center justify-center animate-spin">
            <span className="text-2xl filter drop-shadow">⭐</span>
          </div>
        );
      case 'deodorant_can':
        return (
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <span className="text-2xl filter drop-shadow">💨</span>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Obstacles */}
      {obstacles.map((obs) => (
        <div
          key={obs.id}
          className="absolute transition-none"
          style={{
            left: `${obs.x}px`,
            top: `${obs.y}px`,
            width: `${obs.width}px`,
            height: `${obs.height}px`,
          }}
        >
          {renderObstacleVisual(obs)}
        </div>
      ))}

      {/* Collectibles */}
      {collectibles.map((col) => {
        if (col.collected) return null;
        return (
          <div
            key={col.id}
            className="absolute transition-none"
            style={{
              left: `${col.x}px`,
              top: `${col.y}px`,
              width: `${col.width}px`,
              height: `${col.height}px`,
            }}
          >
            {renderCollectibleVisual(col)}
          </div>
        );
      })}
    </div>
  );
};
