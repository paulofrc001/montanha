import React from 'react';
import { RunnerState } from '../../types';

interface MontanhaRunnerProps {
  state: RunnerState;
  showFartPuff: boolean;
  isInvulnerable: boolean;
  runCycle: number; // 0 to 1 cycle for leg/arm swing
  cleanLevel: number; // 0 to 100
  isWaterHit?: boolean;
}

export const MontanhaRunner: React.FC<MontanhaRunnerProps> = ({
  state,
  showFartPuff,
  isInvulnerable,
  runCycle,
  cleanLevel,
  isWaterHit = false,
}) => {
  // Leg & arm swing based on run cycle (sine wave)
  const swing = Math.sin(runCycle * Math.PI * 2);
  const leftLegAngle = state === 'running' ? swing * 30 : 0;
  const rightLegAngle = state === 'running' ? -swing * 30 : 0;
  const armSwing = state === 'running' ? -swing * 25 : 0;
  const bellyBob = state === 'running' ? Math.abs(swing) * 4 : 0;

  const isDucking = state === 'ducking';
  const isJumping = state === 'jumping';
  const isTripping = state === 'tripping';
  const isTurbo = state === 'turbo';

  // Dirt intensity (1.0 = dirty, 0.0 = clean)
  const dirtOpacity = Math.max(0, (100 - cleanLevel) / 100);
  const showStink = cleanLevel < 55;
  const showFlies = cleanLevel < 45;
  const showSweat = cleanLevel < 65;

  return (
    <div
      className={`relative w-28 h-32 select-none pointer-events-none transition-transform duration-100 ${
        isInvulnerable ? 'opacity-70 animate-pulse' : ''
      }`}
    >
      {/* Turbo Aura / Wind Trail */}
      {isTurbo && (
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/40 via-lime-300/30 to-transparent rounded-full blur-md animate-pulse -z-10" />
      )}

      {/* Water splash burst on hit */}
      {isWaterHit && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping">
          <span className="text-3xl">💦</span>
        </div>
      )}

      {/* Cartoony Flatulence Green Spiral Puff behind Montanha */}
      {showFartPuff && (
        <div className="absolute -left-12 bottom-6 z-20 animate-bounce pointer-events-none">
          <svg width="55" height="42" viewBox="0 0 55 42" className="drop-shadow-lg">
            <g fill="#84cc16" opacity="0.9">
              <circle cx="32" cy="24" r="12" />
              <circle cx="20" cy="18" r="9" />
              <circle cx="10" cy="26" r="7" />
              <circle cx="24" cy="10" r="8" fill="#a3e635" />
            </g>
            <path
              d="M 40 26 Q 24 22 16 30 T 6 24"
              fill="none"
              stroke="#4d7c0f"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Comic sound note */}
            <rect x="0" y="2" width="46" height="16" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <text x="5" y="14" fontSize="10" fontWeight="900" fill="#713f12">
              💨 PUM!
            </text>
          </svg>
        </div>
      )}

      {/* Stink waves when dirty */}
      {showStink && (
        <div className="absolute top-2 left-6 pointer-events-none opacity-70 animate-pulse">
          <svg width="40" height="30" viewBox="0 0 40 30">
            <path d="M 10 25 Q 5 15 15 8" fill="none" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,4" />
            <path d="M 22 26 Q 16 16 26 6" fill="none" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" strokeDasharray="4,4" />
          </svg>
        </div>
      )}

      {/* Occasional buzzing fly */}
      {showFlies && (
        <div className="absolute top-4 -right-2 pointer-events-none animate-fly-1">
          <svg width="14" height="14" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="3.5" fill="#1e293b" />
            <ellipse cx="6" cy="6" rx="3" ry="1.5" fill="#bae6fd" opacity="0.8" />
            <ellipse cx="10" cy="6" rx="3" ry="1.5" fill="#bae6fd" opacity="0.8" />
          </svg>
        </div>
      )}

      {/* Big Turbo Rocket Exhaust Cloud */}
      {isTurbo && (
        <div className="absolute -left-16 bottom-4 z-10 pointer-events-none">
          <svg width="70" height="40" viewBox="0 0 70 40" className="drop-shadow-lg">
            <ellipse cx="40" cy="20" rx="22" ry="14" fill="#84cc16" opacity="0.9" />
            <ellipse cx="25" cy="20" rx="16" ry="10" fill="#a3e635" opacity="0.85" />
            <circle cx="10" cy="20" r="8" fill="#bef264" opacity="0.9" />
            <path
              d="M 60 20 L 5 8 M 55 24 L 2 26"
              stroke="#ecfccb"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <text x="2" y="36" fontSize="10" fontWeight="900" fill="#15803d">
              TURBO! 🚀
            </text>
          </svg>
        </div>
      )}

      {/* Main Runner SVG */}
      <svg
        viewBox="0 0 140 160"
        className={`w-full h-full drop-shadow-md transition-all duration-75 ${
          isDucking
            ? 'scale-y-[0.62] scale-x-[1.12] translate-y-7'
            : isJumping
            ? '-rotate-6 -translate-y-2'
            : isTripping
            ? 'rotate-12 translate-y-2'
            : ''
        }`}
      >
        <defs>
          <radialGradient id="runnerSkin" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="65%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba063" />
          </radialGradient>

          <radialGradient id="runnerBelly" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fff3e6" />
            <stop offset="60%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba063" />
          </radialGradient>

          <linearGradient id="runnerShorts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dirtOpacity > 0.4 ? '#0284c7' : '#38bdf8'} />
            <stop offset="100%" stopColor={dirtOpacity > 0.4 ? '#0369a1' : '#0ea5e9'} />
          </linearGradient>

          <radialGradient id="runnerMud" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#78350f" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow on floor */}
        {!isJumping && (
          <ellipse
            cx="68"
            cy="154"
            rx={isDucking ? 44 : 34}
            ry="7"
            fill="#000000"
            opacity="0.22"
          />
        )}

        {/* Back Arm */}
        <g transform={`rotate(${-armSwing} 70 80)`}>
          <path
            d="M 68 76 Q 48 90 42 108"
            fill="none"
            stroke="url(#runnerSkin)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <circle cx="40" cy="110" r="7.5" fill="#fba063" stroke="#ea580c" strokeWidth="2" />
        </g>

        {/* Back Leg */}
        <g transform={`rotate(${leftLegAngle} 62 118)`}>
          <path
            d="M 62 118 Q 50 134 46 148"
            fill="none"
            stroke="url(#runnerSkin)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <ellipse cx="44" cy="150" rx="9" ry="5.5" fill="#fba063" stroke="#ea580c" strokeWidth="2" />
        </g>

        {/* Front Leg */}
        <g transform={`rotate(${rightLegAngle} 78 118)`}>
          <path
            d="M 76 118 Q 88 134 94 148"
            fill="none"
            stroke="url(#runnerSkin)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <ellipse cx="98" cy="150" rx="9" ry="5.5" fill="#fba063" stroke="#ea580c" strokeWidth="2" />
        </g>

        {/* Chubby Torso & Belly (With run bobbing) */}
        <g transform={`translate(0, ${bellyBob})`}>
          {/* Big Belly Silhouette */}
          <path
            d="M 45 74 
               C 35 90, 32 114, 48 128 
               C 62 138, 98 138, 108 124 
               C 118 110, 114 88, 98 72 
               C 86 62, 55 62, 45 74 Z"
            fill="url(#runnerBelly)"
            stroke="#ea580c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* DIRT PATCHES ON BELLY (fade out as cleanLevel increases!) */}
          {dirtOpacity > 0.05 && (
            <g opacity={dirtOpacity}>
              <ellipse cx="68" cy="94" rx="14" ry="10" fill="url(#runnerMud)" />
              <ellipse cx="88" cy="104" rx="10" ry="7" fill="url(#runnerMud)" />
              <ellipse cx="56" cy="112" rx="8" ry="6" fill="url(#runnerMud)" />
              <circle cx="76" cy="85" r="3" fill="#451a03" opacity="0.6" />
            </g>
          )}

          {/* Sparkles when clean */}
          {cleanLevel > 75 && (
            <g className="animate-sparkle">
              <polygon points="76,82 78,76 80,82 86,84 80,86 78,92 76,86 70,84" fill="#38bdf8" />
              <circle cx="60" cy="95" r="2" fill="#facc15" />
            </g>
          )}

          {/* Chubby Navel */}
          <ellipse cx="76" cy="106" rx="3.5" ry="2.5" fill="#c2410c" />

          {/* Boxer Shorts */}
          <path
            d="M 46 112 
               C 44 128, 56 136, 74 136 
               C 76 136, 78 132, 80 132 
               C 82 132, 84 136, 88 136 
               C 104 136, 110 126, 108 112 Z"
            fill="url(#runnerShorts)"
            stroke="#0369a1"
            strokeWidth="3"
          />

          {/* Mud smudges on shorts */}
          {dirtOpacity > 0.2 && (
            <ellipse cx="94" cy="124" rx="7" ry="5" fill="#451a03" opacity={dirtOpacity * 0.7} />
          )}

          {/* Yellow Duck on Shorts */}
          <ellipse cx="62" cy="122" rx="4" ry="3" fill="#facc15" />
          <circle cx="65" cy="120" r="2.5" fill="#facc15" />
        </g>

        {/* Front Arm */}
        <g transform={`rotate(${armSwing} 74 80)`}>
          <path
            d="M 74 76 Q 96 90 104 104"
            fill="none"
            stroke="url(#runnerSkin)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <circle cx="106" cy="106" r="8" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
          {/* Mud on arm */}
          {dirtOpacity > 0.25 && (
            <ellipse cx="88" cy="88" rx="6" ry="4" fill="#451a03" opacity={dirtOpacity * 0.7} />
          )}
        </g>

        {/* Head & Face */}
        <g id="runner-head">
          <circle cx="76" cy="46" r="26" fill="url(#runnerSkin)" stroke="#ea580c" strokeWidth="3" />

          {/* Mud smudges on face */}
          {dirtOpacity > 0.1 && (
            <ellipse cx="64" cy="52" rx="6" ry="4" fill="#451a03" opacity={dirtOpacity * 0.6} />
          )}

          {/* Shower Cap / Bath Bandana */}
          <path
            d="M 52 42 C 50 20, 68 14, 82 14 C 98 14, 104 22, 102 42 Z"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="3"
          />
          <ellipse cx="78" cy="26" rx="5" ry="3.5" fill="#ffffff" />
          <circle cx="78" cy="25" r="2" fill="#eab308" />

          {/* Rosy Cheek */}
          <ellipse cx="94" cy="52" rx="5" ry="3" fill="#fb7185" opacity="0.6" />

          {/* Nose */}
          <ellipse cx="88" cy="48" rx="5" ry="4" fill="#fba063" stroke="#ea580c" strokeWidth="1.8" />

          {/* EYES */}
          {isWaterHit ? (
            /* Shocked wide eyes when water hits! */
            <g>
              <ellipse cx="74" cy="42" rx="7" ry="8" fill="#fff" stroke="#1e293b" strokeWidth="2" />
              <circle cx="74" cy="42" r="3" fill="#1e293b" />
              <ellipse cx="88" cy="42" rx="7" ry="8" fill="#fff" stroke="#1e293b" strokeWidth="2" />
              <circle cx="88" cy="42" r="3" fill="#1e293b" />
              {/* Surprised eyebrows */}
              <path d="M 68 32 L 80 34 M 84 34 L 96 32" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : isTripping ? (
            /* Dizzy eyes (@@) */
            <g>
              <text x="64" y="47" fontSize="13" fontWeight="bold" fill="#1e293b">@</text>
              <text x="82" y="47" fontSize="13" fontWeight="bold" fill="#1e293b">@</text>
            </g>
          ) : showFartPuff ? (
            /* Looking back cheeky / surprised face */
            <g>
              <circle cx="70" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="68" cy="42" r="2.5" fill="#1e293b" />
              <circle cx="84" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="82" cy="42" r="2.5" fill="#1e293b" />
            </g>
          ) : cleanLevel === 100 ? (
            /* Super clean happy eyes */
            <g>
              <path d="M 68 44 Q 76 36 84 44" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 82 44 Q 90 36 98 44" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : (
            /* Determined forward running eyes */
            <g>
              <circle cx="74" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="76" cy="42" r="2.5" fill="#1e293b" />
              <circle cx="88" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="90" cy="42" r="2.5" fill="#1e293b" />
              <path d="M 70 36 L 80 38 M 86 38 L 96 35" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* MOUTH */}
          {isWaterHit ? (
            /* Indignant shouting mouth */
            <ellipse cx="86" cy="56" rx="6" ry="7" fill="#b91c1c" stroke="#1e293b" strokeWidth="2" />
          ) : isTripping ? (
            <path d="M 76 56 Q 84 50 92 56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          ) : showFartPuff ? (
            <ellipse cx="84" cy="54" rx="3" ry="3.5" fill="#991b1b" stroke="#1e293b" strokeWidth="1.5" />
          ) : cleanLevel === 100 ? (
            /* Sparkling clean smile with teeth */
            <g>
              <path d="M 74 52 Q 86 64 96 52 Z" fill="#991b1b" stroke="#1e293b" strokeWidth="2" />
              <path d="M 78 52 Q 86 56 92 52" fill="#fff" />
              <polygon points="90,52 92,48 94,52 92,56" fill="#38bdf8" />
            </g>
          ) : (
            <path
              d="M 76 52 Q 86 62 94 52 Z"
              fill="#991b1b"
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Sweat drop when running/sweaty */}
          {showSweat && (
            <path
              d="M 64 36 C 62 42, 60 45, 63 47 C 65 49, 68 47, 67 43 Z"
              fill="#38bdf8"
              className="animate-pulse"
            />
          )}
        </g>
      </svg>
    </div>
  );
};
