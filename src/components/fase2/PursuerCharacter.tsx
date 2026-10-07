import React, { memo } from 'react';
import { WaterAttackType } from '../../types';

interface PursuerCharacterProps {
  currentWeapon: WaterAttackType;
  isAiming: boolean;
  isFartNearby?: boolean;
}

export const PursuerCharacter: React.FC<PursuerCharacterProps> = memo(({
  currentWeapon,
  isAiming,
  isFartNearby = false,
}) => {
  return (
    <div className="relative w-32 h-36 select-none pointer-events-none">
      {/* Speech shout bubble from pursuer */}
      {isAiming && (
        <div className="absolute -top-12 left-4 bg-sky-500 text-white font-black text-xs px-2.5 py-1 rounded-xl border-2 border-sky-300 shadow-lg whitespace-nowrap animate-bounce z-30">
          {currentWeapon === 'bucket_lob'
            ? 'TOMA BALDE D’ÁGUA! 🪣'
            : currentWeapon === 'super_jet'
            ? 'SUPER JATO LIMPACRACA! 🚨'
            : 'ÁGUA NELE!! 🚿'}
        </div>
      )}

      {isFartNearby && !isAiming && (
        <div className="absolute -top-10 left-6 bg-lime-100 text-lime-900 font-black text-[11px] px-2 py-0.5 rounded-lg border border-lime-400 shadow-sm animate-pulse z-30">
          Ugh, que inhaca! 🤢💨
        </div>
      )}

      {/* Pursuer SVG */}
      <svg viewBox="0 0 150 160" className="w-full h-full drop-shadow">
        <defs>
          <radialGradient id="pursuerSkin" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="64" cy="154" rx="30" ry="6" fill="#000000" opacity="0.22" />

        {/* Back Leg with GPU CSS animation */}
        <g className="anim-pursuer-leg-l">
          <path d="M 58 118 L 44 148" stroke="#475569" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="42" cy="150" rx="8" ry="5" fill="#f43f5e" />
        </g>

        {/* Front Leg with GPU CSS animation */}
        <g className="anim-pursuer-leg-r">
          <path d="M 70 118 L 86 148" stroke="#475569" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="88" cy="150" rx="8" ry="5" fill="#f43f5e" />
        </g>

        {/* Body (Bathrobe) */}
        <path
          d="M 50 76 L 42 124 L 84 124 L 78 76 Z"
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth="3"
        />

        {/* Back Arm holding sponge */}
        <g transform="rotate(-15 48 82)">
          <path d="M 48 82 L 28 66" stroke="url(#pursuerSkin)" strokeWidth="9" strokeLinecap="round" />
          <rect x="14" y="52" width="20" height="16" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
        </g>

        {/* Head */}
        <circle cx="68" cy="50" r="20" fill="url(#pursuerSkin)" stroke="#ea580c" strokeWidth="2.5" />

        {/* Shower Cap with Bubbles */}
        <path
          d="M 50 46 C 48 28, 62 24, 72 24 C 84 24, 88 32, 86 46 Z"
          fill="#ec4899"
          stroke="#be185d"
          strokeWidth="2.5"
        />
        <circle cx="56" cy="30" r="4" fill="#f472b6" />
        <circle cx="68" cy="26" r="4" fill="#f472b6" />
        <circle cx="80" cy="30" r="4" fill="#f472b6" />

        {/* Eyes */}
        {isFartNearby ? (
          <g>
            <path d="M 64 46 L 72 46" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 78 46 L 86 46" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="70" cy="46" r="3.5" fill="#1e293b" />
            <circle cx="82" cy="46" r="3.5" fill="#1e293b" />
            <path d="M 66 42 L 74 44 M 78 44 L 86 42" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Mouth */}
        <ellipse cx="78" cy="56" rx="5" ry="4" fill="#b91c1c" />

        {/* Front Arm & WEAPONS */}
        <g transform={isAiming ? 'rotate(35 74 82)' : 'rotate(10 74 82)'}>
          <path d="M 74 82 L 102 76" stroke="url(#pursuerSkin)" strokeWidth="10" strokeLinecap="round" />

          {/* Weapon Specific Graphic */}
          {currentWeapon === 'water_gun' ? (
            <g transform="translate(100, 62)">
              <rect x="0" y="8" width="28" height="12" rx="3" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
              <rect x="2" y="18" width="8" height="12" rx="2" fill="#9333ea" />
              <ellipse cx="14" cy="5" rx="10" ry="5" fill="#38bdf8" />
            </g>
          ) : currentWeapon === 'bucket_lob' ? (
            <g transform="translate(98, 56)">
              <polygon points="4,10 26,10 22,32 8,32" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
              <ellipse cx="15" cy="10" rx="11" ry="4" fill="#38bdf8" />
              <path d="M 2 12 Q 15 2 28 12" fill="none" stroke="#64748b" strokeWidth="2" />
            </g>
          ) : currentWeapon === 'super_jet' ? (
            <g transform="translate(96, 62)">
              <polygon points="0,6 36,2 36,22 0,18" fill="#eab308" stroke="#ca8a04" strokeWidth="2.5" />
              <ellipse cx="36" cy="12" rx="4" ry="10" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
              <rect x="-8" y="8" width="12" height="8" rx="2" fill="#ef4444" />
            </g>
          ) : (
            <g transform="translate(98, 64)">
              <ellipse cx="10" cy="10" rx="8" ry="12" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
              <path d="M -6 10 Q 0 10 10 10" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" fill="none" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
});

PursuerCharacter.displayName = 'PursuerCharacter';
