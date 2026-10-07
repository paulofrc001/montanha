import React, { memo } from 'react';
import { RunnerState } from '../../types';

interface MontanhaRunnerProps {
  state: RunnerState;
  showFartPuff: boolean;
  isInvulnerable: boolean;
  cleanLevel: number; // 0 to 100
  isWaterHit?: boolean;
}

export const MontanhaRunner: React.FC<MontanhaRunnerProps> = memo(({
  state,
  showFartPuff,
  isInvulnerable,
  cleanLevel,
  isWaterHit = false,
}) => {
  const isDucking = state === 'ducking';
  const isJumping = state === 'jumping';
  const isTripping = state === 'tripping';
  const isTurbo = state === 'turbo';
  const isRunning = state === 'running';

  // Dirt intensity (1.0 = dirty, 0.0 = clean)
  const dirtOpacity = Math.max(0, (100 - cleanLevel) / 100);
  const showStink = cleanLevel < 55;
  const showFlies = cleanLevel < 45;
  const showSweat = cleanLevel < 65;

  return (
    <div
      className={`relative w-28 h-32 select-none pointer-events-none ${
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
        className={`w-full h-full drop-shadow-md ${
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
        <g className={isTurbo ? 'anim-turbo-arm' : isRunning ? 'anim-run-arm' : ''}>
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
        <g className={isTurbo ? 'anim-turbo-leg-l' : isRunning ? 'anim-run-leg-l' : ''}>
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
        <g className={isTurbo ? 'anim-turbo-leg-r' : isRunning ? 'anim-run-leg-r' : ''}>
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
        <g className={isTurbo ? 'anim-turbo-belly' : isRunning ? 'anim-run-belly' : ''}>
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
          />

          {/* Navel */}
          <circle cx="78" cy="106" r="3.2" fill="#ea580c" opacity="0.6" />

          {/* Running Shorts */}
          <path
            d="M 45 112 
               C 42 124, 48 138, 62 140 
               L 72 126 L 82 140 
               C 96 138, 102 124, 100 112 Z"
            fill="url(#runnerShorts)"
            stroke="#0369a1"
            strokeWidth="3"
          />

          {/* Dirt Spots on Belly & Shorts (fade as cleanLevel increases) */}
          {dirtOpacity > 0.1 && (
            <g opacity={dirtOpacity}>
              <ellipse cx="62" cy="88" rx="10" ry="7" fill="url(#runnerMud)" />
              <ellipse cx="88" cy="98" rx="8" ry="6" fill="url(#runnerMud)" />
              <ellipse cx="54" cy="104" rx="7" ry="5" fill="url(#runnerMud)" />
              <circle cx="70" cy="78" r="4.5" fill="#78350f" opacity="0.75" />
              <circle cx="82" cy="118" r="4" fill="#78350f" opacity="0.7" />
            </g>
          )}

          {/* Sweat droplets */}
          {showSweat && (
            <g className="animate-sweat">
              <ellipse cx="88" cy="76" rx="2.5" ry="4.5" fill="#38bdf8" opacity="0.85" />
              <ellipse cx="58" cy="80" rx="2" ry="4" fill="#38bdf8" opacity="0.85" />
            </g>
          )}

          {/* Head & Face */}
          <g transform="translate(6, -6)">
            {/* Round Head */}
            <circle
              cx="76"
              cy="48"
              r="26"
              fill="url(#runnerSkin)"
              stroke="#ea580c"
              strokeWidth="3.5"
            />

            {/* Double Chin */}
            <path
              d="M 64 68 Q 76 76 88 68"
              fill="none"
              stroke="#ea580c"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Cheeks */}
            <circle cx="62" cy="54" r="6" fill="#f43f5e" opacity="0.35" />
            <circle cx="90" cy="54" r="6" fill="#f43f5e" opacity="0.35" />

            {/* Eyes */}
            {isTripping ? (
              // Dizzy X eyes
              <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
                <line x1="64" y1="42" x2="70" y2="48" />
                <line x1="70" y1="42" x2="64" y2="48" />
                <line x1="82" y1="42" x2="88" y2="48" />
                <line x1="88" y1="42" x2="82" y2="48" />
              </g>
            ) : isWaterHit ? (
              // Screaming shut eyes > <
              <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 62 44 L 68 47 L 62 50" />
                <path d="M 88 44 L 82 47 L 88 50" />
              </g>
            ) : isJumping ? (
              // Determined wide open eyes
              <g>
                <circle cx="68" cy="46" r="4.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
                <circle cx="69" cy="46" r="2.2" fill="#0f172a" />
                <circle cx="84" cy="46" r="4.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
                <circle cx="85" cy="46" r="2.2" fill="#0f172a" />
              </g>
            ) : (
              // Running focused eyes looking forward/nervous
              <g>
                <circle cx="68" cy="46" r="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="70" cy="46" r="2" fill="#0f172a" />
                <circle cx="84" cy="46" r="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="86" cy="46" r="2" fill="#0f172a" />
              </g>
            )}

            {/* Eyebrows */}
            {isWaterHit || isTripping ? (
              <g stroke="#7c2d12" strokeWidth="3" strokeLinecap="round">
                <path d="M 60 38 L 70 42" />
                <path d="M 90 38 L 80 42" />
              </g>
            ) : (
              <g stroke="#7c2d12" strokeWidth="3" strokeLinecap="round">
                <path d="M 62 40 Q 68 36 74 40" />
                <path d="M 80 40 Q 86 36 92 40" />
              </g>
            )}

            {/* Nose */}
            <circle cx="78" cy="52" r="3.5" fill="#fba063" stroke="#ea580c" strokeWidth="1.8" />

            {/* Mouth */}
            {isTripping ? (
              // Wobbly mouth
              <path
                d="M 68 62 Q 74 58 78 63 T 88 61"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : isWaterHit ? (
              // Screaming open mouth
              <ellipse cx="78" cy="62" rx="7" ry="8" fill="#881337" stroke="#1e293b" strokeWidth="2" />
            ) : isDucking ? (
              // Clenched grinning teeth
              <g>
                <rect x="70" y="58" width="16" height="6" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                <line x1="78" y1="58" x2="78" y2="64" stroke="#1e293b" strokeWidth="1.5" />
              </g>
            ) : isJumping ? (
              // Confident smirk
              <path
                d="M 70 60 Q 78 68 86 60"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              // Panting tongue out
              <g>
                <ellipse cx="78" cy="60" rx="6" ry="4" fill="#881337" stroke="#1e293b" strokeWidth="1.8" />
                <path d="M 75 62 C 75 66 81 66 81 62 Z" fill="#f43f5e" />
              </g>
            )}

            {/* Hair strands */}
            <path
              d="M 68 24 Q 72 16 78 22 Q 84 14 88 23"
              fill="none"
              stroke="#7c2d12"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* Front Arm (Pumping) */}
          <g className={isTurbo ? 'anim-turbo-arm' : isRunning ? 'anim-run-arm' : ''}>
            <path
              d="M 88 78 Q 106 94 114 84"
              fill="none"
              stroke="url(#runnerSkin)"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <circle cx="116" cy="82" r="8" fill="#fba063" stroke="#ea580c" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  );
});

MontanhaRunner.displayName = 'MontanhaRunner';
