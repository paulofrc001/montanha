import React from 'react';
import { RunnerState } from '../../types';

interface MontanhaRunnerProps {
  state: RunnerState;
  showFartPuff: boolean;
  isInvulnerable: boolean;
  runCycle: number; // 0 to 1 cycle for leg/arm swing
}

export const MontanhaRunner: React.FC<MontanhaRunnerProps> = ({
  state,
  showFartPuff,
  isInvulnerable,
  runCycle,
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

      {/* Cartoony Flatulence Green Spiral Puff behind Montanha */}
      {showFartPuff && (
        <div className="absolute -left-10 bottom-6 z-10 animate-bounce pointer-events-none">
          <svg width="45" height="35" viewBox="0 0 50 40" className="drop-shadow">
            <g fill="#84cc16" opacity="0.85">
              <circle cx="28" cy="22" r="10" />
              <circle cx="18" cy="18" r="8" />
              <circle cx="10" cy="24" r="6" />
              <circle cx="22" cy="12" r="7" fill="#a3e635" />
            </g>
            {/* Wind spiral */}
            <path
              d="M 35 24 Q 22 20 16 28 T 6 22"
              fill="none"
              stroke="#65a30d"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Comic sound note */}
            <text x="0" y="10" fontSize="11" fontWeight="bold" fill="#4d7c0f">
              💨 toot!
            </text>
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
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
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
        </g>

        {/* Head & Face */}
        <g id="runner-head">
          {/* Head Shape */}
          <circle cx="76" cy="46" r="26" fill="url(#runnerSkin)" stroke="#ea580c" strokeWidth="3" />

          {/* Shower Cap / Bath Bandana */}
          <path
            d="M 52 42 C 50 20, 68 14, 82 14 C 98 14, 104 22, 102 42 Z"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="3"
          />
          {/* Duck icon on cap */}
          <ellipse cx="78" cy="26" rx="5" ry="3.5" fill="#ffffff" />
          <circle cx="78" cy="25" r="2" fill="#eab308" />

          {/* Rosy Cheek */}
          <ellipse cx="94" cy="52" rx="5" ry="3" fill="#fb7185" opacity="0.6" />

          {/* Nose */}
          <ellipse cx="88" cy="48" rx="5" ry="4" fill="#fba063" stroke="#ea580c" strokeWidth="1.8" />

          {/* EYES */}
          {isTripping ? (
            /* Dizzy eyes (@@) */
            <g>
              <text x="64" y="47" fontSize="13" fontWeight="bold" fill="#1e293b">@</text>
              <text x="82" y="47" fontSize="13" fontWeight="bold" fill="#1e293b">@</text>
            </g>
          ) : showFartPuff ? (
            /* Looking back cheeky / surprised face */
            <g>
              {/* Eyes shifted back to the left */}
              <circle cx="70" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="68" cy="42" r="2.5" fill="#1e293b" />
              <circle cx="84" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="82" cy="42" r="2.5" fill="#1e293b" />
            </g>
          ) : (
            /* Determined forward running eyes */
            <g>
              <circle cx="74" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="76" cy="42" r="2.5" fill="#1e293b" />
              <circle cx="88" cy="42" r="5" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="90" cy="42" r="2.5" fill="#1e293b" />
              {/* Confident Eyebrow */}
              <path d="M 70 36 L 80 38 M 86 38 L 96 35" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* MOUTH */}
          {isTripping ? (
            <path d="M 76 56 Q 84 50 92 56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          ) : showFartPuff ? (
            /* Whistling / cheeky small 'o' mouth */
            <ellipse cx="84" cy="54" rx="3" ry="3.5" fill="#991b1b" stroke="#1e293b" strokeWidth="1.5" />
          ) : (
            /* Open determined panting smile */
            <path
              d="M 76 52 Q 86 62 94 52 Z"
              fill="#991b1b"
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Sweat drop when running hard */}
          <path
            d="M 64 36 C 62 42, 60 45, 63 47 C 65 49, 68 47, 67 43 Z"
            fill="#38bdf8"
            className="animate-pulse"
          />
        </g>
      </svg>
    </div>
  );
};
