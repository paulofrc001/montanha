import React from 'react';

interface PursuerCharacterProps {
  distance: number; // 0 to 100 meters
  runCycle: number;
}

export const PursuerCharacter: React.FC<PursuerCharacterProps> = ({
  distance,
  runCycle,
}) => {
  // If distance is far away (> 85m), pursuer is barely visible at the edge
  // When distance gets close (< 30m), pursuer is right on Montanha's tail!
  const swing = Math.sin(runCycle * Math.PI * 2);
  const leftLegAngle = swing * 35;
  const rightLegAngle = -swing * 35;
  const armSwing = -swing * 30;

  // Horizontal offset calculation based on distance (0m = very close x: -20px, 60m = x: -140px)
  const isDangerous = distance <= 25;

  return (
    <div
      className={`relative w-28 h-32 select-none pointer-events-none transition-all duration-300 ${
        isDangerous ? 'animate-pulse' : ''
      }`}
    >
      {/* Speech shout bubble from pursuer when close */}
      {distance < 40 && (
        <div className="absolute -top-10 left-1 bg-amber-100 text-amber-950 font-black text-[10px] px-2 py-1 rounded-xl border border-amber-400 shadow-sm whitespace-nowrap animate-bounce">
          {distance < 20 ? 'PEGA ELE!! 🧽' : 'VEM PRO BANHO!! 🚿'}
        </div>
      )}

      {/* Pursuer SVG */}
      <svg viewBox="0 0 140 160" className="w-full h-full drop-shadow">
        <defs>
          <radialGradient id="pursuerSkin" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="64" cy="154" rx="30" ry="6" fill="#000000" opacity="0.22" />

        {/* Back Leg */}
        <g transform={`rotate(${leftLegAngle} 58 118)`}>
          <path d="M 58 118 L 44 148" stroke="#475569" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="42" cy="150" rx="8" ry="5" fill="#f43f5e" />
        </g>

        {/* Front Leg */}
        <g transform={`rotate(${rightLegAngle} 70 118)`}>
          <path d="M 70 118 L 86 148" stroke="#475569" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="88" cy="150" rx="8" ry="5" fill="#f43f5e" />
        </g>

        {/* Body (Bathrobe / Apron) */}
        <path
          d="M 50 76 L 42 124 L 84 124 L 78 76 Z"
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth="3"
        />

        {/* Back Arm holding big yellow sponge */}
        <g transform={`rotate(${-armSwing} 48 82)`}>
          <path d="M 48 82 L 28 66" stroke="url(#pursuerSkin)" strokeWidth="9" strokeLinecap="round" />
          {/* Big Soapy Sponge */}
          <rect x="14" y="52" width="22" height="18" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="22" cy="58" r="2" fill="#eab308" />
          <circle cx="28" cy="62" r="2" fill="#eab308" />
          <circle cx="32" cy="50" r="3" fill="#bae6fd" opacity="0.8" />
        </g>

        {/* Head */}
        <circle cx="68" cy="50" r="20" fill="url(#pursuerSkin)" stroke="#ea580c" strokeWidth="2.5" />

        {/* Shower Cap / Curler hair */}
        <path
          d="M 50 46 C 48 28, 62 24, 72 24 C 84 24, 88 32, 86 46 Z"
          fill="#ec4899"
          stroke="#be185d"
          strokeWidth="2.5"
        />
        <circle cx="56" cy="30" r="4" fill="#f472b6" />
        <circle cx="68" cy="26" r="4" fill="#f472b6" />
        <circle cx="80" cy="30" r="4" fill="#f472b6" />

        {/* Eyes (Fierce determination) */}
        <circle cx="68" cy="46" r="3.5" fill="#1e293b" />
        <circle cx="78" cy="46" r="3.5" fill="#1e293b" />
        <path d="M 64 42 L 72 44 M 76 44 L 84 42" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

        {/* Shouting Open Mouth */}
        <ellipse cx="76" cy="56" rx="5" ry="4" fill="#b91c1c" />

        {/* Front Arm waving shower hose / water sprayer */}
        <g transform={`rotate(${armSwing} 74 82)`}>
          <path d="M 74 82 L 98 72" stroke="url(#pursuerSkin)" strokeWidth="10" strokeLinecap="round" />
          {/* Shower Head */}
          <ellipse cx="106" cy="68" rx="8" ry="12" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          {/* Water spray lines */}
          <path
            d="M 114 66 L 126 62 M 115 70 L 130 72 M 114 74 L 125 80"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};
