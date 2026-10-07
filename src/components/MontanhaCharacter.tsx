import React from 'react';
import { GameStage, DirtZone } from '../types';

interface MontanhaCharacterProps {
  stage: GameStage;
  zones: DirtZone[];
  overallDirt: number; // 0 to 100
  isVictory: boolean;
  isGameOver: boolean;
  isScrubbing: boolean;
  bubbleCount: number;
}

export const MontanhaCharacter: React.FC<MontanhaCharacterProps> = ({
  stage,
  zones,
  overallDirt,
  isVictory,
  isGameOver,
  isScrubbing,
  bubbleCount,
}) => {
  // Eye state:
  // When victory: joyful squint with star eyes
  // When scrubbing: joyful squinting / laughing
  // When high dirt: sheepish / tired look
  const isHappy = isVictory || isScrubbing || stage === 'DEODORANT';
  const showStink = overallDirt > 25 && !isVictory;
  const showFlies = overallDirt > 40 && !isVictory;
  const showSweat = overallDirt > 35 && !isVictory;

  return (
    <div className="relative w-full max-w-[420px] aspect-[4/5] mx-auto select-none pointer-events-none flex items-center justify-center">
      {/* Sparkle background glow on victory */}
      {isVictory && (
        <div className="absolute inset-0 -inset-x-8 rounded-full bg-gradient-to-t from-amber-200/40 via-sky-200/50 to-pink-200/40 blur-2xl animate-pulse pointer-events-none -z-10" />
      )}

      {/* Main Character SVG */}
      <svg
        viewBox="0 0 400 500"
        className={`w-full h-full drop-shadow-xl transition-transform duration-300 ${
          isScrubbing ? 'scale-[1.02] -rotate-1' : ''
        } ${isVictory ? 'scale-105' : ''}`}
      >
        <defs>
          <radialGradient id="skinGrad" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="60%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba063" />
          </radialGradient>

          <radialGradient id="bellyGrad" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fff3e6" />
            <stop offset="60%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba063" />
          </radialGradient>

          <linearGradient id="shortsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <radialGradient id="mudGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#78350f" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#451a03" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#290f02" stopOpacity="0" />
          </radialGradient>

          {/* Foam Bubble Gradient */}
          <radialGradient id="bubbleGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* --- SHADOW UNDER MONTANHA --- */}
        <ellipse cx="200" cy="482" rx="140" ry="18" fill="#000000" opacity="0.16" />

        {/* --- LEGS & FEET --- */}
        {/* Left Leg */}
        <g id="left-leg">
          <path
            d="M 140 370 C 130 410, 132 445, 142 465 C 145 472, 165 472, 172 468 C 178 450, 175 410, 175 370 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Foot */}
          <path
            d="M 132 460 C 120 465, 122 478, 145 478 C 170 478, 176 470, 170 460 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="3.5"
          />
          {/* Toes */}
          <circle cx="128" cy="471" r="3.5" fill="#fba063" />
          <circle cx="134" cy="474" r="3.5" fill="#fba063" />
          <circle cx="141" cy="475" r="3.5" fill="#fba063" />
        </g>

        {/* Right Leg */}
        <g id="right-leg">
          <path
            d="M 225 370 C 225 410, 222 450, 228 468 C 235 472, 255 472, 258 465 C 268 445, 270 410, 260 370 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Foot */}
          <path
            d="M 230 460 C 224 470, 230 478, 255 478 C 278 478, 280 465, 268 460 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="3.5"
          />
          {/* Toes */}
          <circle cx="272" cy="471" r="3.5" fill="#fba063" />
          <circle cx="266" cy="474" r="3.5" fill="#fba063" />
          <circle cx="259" cy="475" r="3.5" fill="#fba063" />
        </g>

        {/* --- ARMS (BEHIND BODY) --- */}
        {/* Left Arm */}
        <g id="left-arm" className={isVictory ? 'animate-bounce' : ''}>
          {isVictory ? (
            /* Victory raised arm */
            <path
              d="M 120 220 C 80 180, 50 140, 70 120 C 85 105, 115 150, 130 195 Z"
              fill="url(#skinGrad)"
              stroke="#ea580c"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          ) : (
            /* Resting/hanging relaxed arm */
            <path
              d="M 125 210 C 80 230, 60 270, 70 310 C 78 335, 105 330, 110 300 C 115 270, 125 240, 135 225 Z"
              fill="url(#skinGrad)"
              stroke="#ea580c"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}
          {/* Left Hand */}
          {isVictory ? (
            /* Fist / Thumbs Up */
            <g transform="translate(65, 110)">
              <circle cx="0" cy="0" r="14" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="3.5" />
              <path d="M 0 -12 C 5 -20, 15 -18, 12 -8 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
            </g>
          ) : (
            <ellipse cx="80" cy="320" rx="14" ry="12" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="3.5" />
          )}
        </g>

        {/* Right Arm */}
        <g id="right-arm" className={isVictory ? 'animate-bounce' : ''}>
          {isVictory ? (
            /* Victory raised arm right */
            <path
              d="M 280 220 C 320 180, 350 140, 330 120 C 315 105, 285 150, 270 195 Z"
              fill="url(#skinGrad)"
              stroke="#ea580c"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M 275 210 C 320 230, 340 270, 330 310 C 322 335, 295 330, 290 300 C 285 270, 275 240, 265 225 Z"
              fill="url(#skinGrad)"
              stroke="#ea580c"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}
          {/* Right Hand */}
          {isVictory ? (
            <g transform="translate(335, 110)">
              <circle cx="0" cy="0" r="14" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="3.5" />
              <path d="M 0 -12 C -5 -20, -15 -18, -12 -8 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
            </g>
          ) : (
            <ellipse cx="320" cy="320" rx="14" ry="12" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="3.5" />
          )}
        </g>

        {/* --- CHUBBY TORSO & BELLY --- */}
        <g id="torso">
          {/* Main big belly and chest path */}
          <path
            d="M 125 200 
               C 105 240, 95 310, 110 360 
               C 125 400, 275 400, 290 360 
               C 305 310, 295 240, 275 200 
               C 255 170, 145 170, 125 200 Z"
            fill="url(#bellyGrad)"
            stroke="#ea580c"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Chest Pec Creases */}
          <path
            d="M 160 220 Q 200 235 240 220"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 175 226 Q 200 238 225 226"
            fill="none"
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Cute Navel (Umbigo redondo do gordinho) */}
          <ellipse cx="200" cy="318" rx="5.5" ry="4" fill="#c2410c" />
          <path
            d="M 196 316 Q 200 322 204 316"
            fill="none"
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Cute Belly Roll Shadow */}
          <path
            d="M 155 335 Q 200 350 245 335"
            fill="none"
            stroke="#f97316"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>

        {/* --- BOXER SHORTS / BATH SHORTS --- */}
        <g id="shorts">
          <path
            d="M 115 350 
               C 112 375, 128 395, 180 395 
               C 192 395, 196 385, 200 385 
               C 204 385, 208 395, 220 395 
               C 272 395, 288 375, 285 350 
               Z"
            fill="url(#shortsGrad)"
            stroke="#0369a1"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Elastic Waistband */}
          <path
            d="M 115 350 Q 200 358 285 350"
            fill="none"
            stroke="#0284c7"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Cute Rubber Duckies on Shorts */}
          <g transform="translate(145, 362) scale(0.65)">
            <ellipse cx="12" cy="12" rx="10" ry="7" fill="#fde047" />
            <circle cx="18" cy="7" r="6" fill="#fde047" />
            <path d="M 23 7 L 27 8 L 23 10 Z" fill="#f97316" />
            <circle cx="19" cy="6" r="1" fill="#000" />
          </g>
          <g transform="translate(225, 362) scale(0.65)">
            <ellipse cx="12" cy="12" rx="10" ry="7" fill="#fde047" />
            <circle cx="18" cy="7" r="6" fill="#fde047" />
            <path d="M 23 7 L 27 8 L 23 10 Z" fill="#f97316" />
            <circle cx="19" cy="6" r="1" fill="#000" />
          </g>
        </g>

        {/* --- HEAD & NECK --- */}
        <g id="neck-and-head">
          {/* Neck */}
          <path
            d="M 160 170 L 160 190 Q 200 200 240 190 L 240 170 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="3.5"
          />
          {/* Double Chin Crease */}
          <path
            d="M 175 182 Q 200 192 225 182"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Head & Chubby Cheeks */}
          <path
            d="M 140 120 
               C 125 145, 130 175, 160 185 
               C 180 192, 220 192, 240 185 
               C 270 175, 275 145, 260 120 
               C 250 95, 235 80, 200 80 
               C 165 80, 150 95, 140 120 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Ears */}
          {/* Left Ear */}
          <g id="left-ear">
            <ellipse cx="138" cy="130" rx="10" ry="14" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="3.5" />
            <path d="M 138 124 Q 134 130 138 136" fill="none" stroke="#ea580c" strokeWidth="2.5" />
          </g>
          {/* Right Ear */}
          <g id="right-ear">
            <ellipse cx="262" cy="130" rx="10" ry="14" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="3.5" />
            <path d="M 262 124 Q 266 130 262 136" fill="none" stroke="#ea580c" strokeWidth="2.5" />
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="158" cy="142" rx="11" ry="7" fill="#fb7185" opacity="0.45" />
          <ellipse cx="242" cy="142" rx="11" ry="7" fill="#fb7185" opacity="0.45" />

          {/* Cute Round Nose */}
          <ellipse cx="200" cy="132" rx="12" ry="9" fill="#fba063" stroke="#ea580c" strokeWidth="3" />
          <path d="M 194 133 Q 200 137 206 133" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" />

          {/* Cute 5 o'clock shadow / stubble */}
          <g opacity="0.3" fill="#78350f">
            <circle cx="178" cy="155" r="1" />
            <circle cx="186" cy="158" r="1" />
            <circle cx="194" cy="162" r="1" />
            <circle cx="202" cy="162" r="1" />
            <circle cx="210" cy="158" r="1" />
            <circle cx="218" cy="155" r="1" />
            <circle cx="182" cy="166" r="1" />
            <circle cx="190" cy="169" r="1" />
            <circle cx="200" cy="170" r="1" />
            <circle cx="210" cy="169" r="1" />
            <circle cx="218" cy="166" r="1" />
          </g>

          {/* EYES */}
          {isHappy ? (
            /* Joyful laughing squint eyes (^_^) */
            <g id="happy-eyes">
              <path
                d="M 166 122 Q 176 112 186 122"
                fill="none"
                stroke="#1e293b"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 214 122 Q 224 112 234 122"
                fill="none"
                stroke="#1e293b"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          ) : isGameOver ? (
            /* Dizzy/Sad Eyes (X_X) */
            <g id="sad-eyes">
              <path d="M 168 116 L 182 126 M 182 116 L 168 126" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 218 116 L 232 126 M 232 116 L 218 126" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : (
            /* Smelly / sheepish round eyes looking cute */
            <g id="regular-eyes">
              {/* Left Eye */}
              <ellipse cx="176" cy="120" rx="9" ry="10" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
              <circle cx="177" cy="121" r="5" fill="#1e293b" />
              <circle cx="175" cy="118" r="2" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="224" cy="120" rx="9" ry="10" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
              <circle cx="223" cy="121" r="5" fill="#1e293b" />
              <circle cx="221" cy="118" r="2" fill="#ffffff" />
            </g>
          )}

          {/* EYEBROWS */}
          {isHappy ? (
            <g>
              <path d="M 164 110 Q 176 104 188 112" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
              <path d="M 236 110 Q 224 104 212 112" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : isGameOver ? (
            <g>
              <path d="M 166 112 L 186 108" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 234 112 L 214 108" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* Worried / sweaty eyebrows */}
              <path d="M 164 112 Q 176 106 186 110" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 236 112 Q 224 106 214 110" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}

          {/* MOUTH */}
          {isVictory ? (
            /* Huge happy grin with sparkling white teeth */
            <g id="victory-mouth">
              <path
                d="M 174 148 Q 200 178 226 148 Z"
                fill="#b91c1c"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path d="M 180 148 Q 200 156 220 148" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
              <path d="M 188 168 Q 200 174 212 168" fill="#f87171" />
              {/* Tooth shine ding */}
              <polygon points="182,148 185,142 188,148 185,154" fill="#38bdf8" className="animate-pulse" />
            </g>
          ) : isHappy ? (
            /* Friendly Open Smile */
            <g id="happy-mouth">
              <path
                d="M 180 148 Q 200 166 220 148 Z"
                fill="#991b1b"
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M 184 148 Q 200 154 216 148" fill="#ffffff" />
            </g>
          ) : isGameOver ? (
            /* Wobbly sad mouth */
            <path
              d="M 184 158 Q 200 146 216 158"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            /* Shy slightly sweaty smile */
            <g id="shy-mouth">
              <path
                d="M 185 148 Q 200 158 215 148"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path d="M 183 146 L 186 150" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 217 146 L 214 150" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* BATH SHOWER CAP / HAIR */}
          <g id="shower-cap">
            <path
              d="M 142 108 
                 C 135 70, 160 45, 200 45 
                 C 240 45, 265 70, 258 108 
                 C 255 116, 245 116, 235 112 
                 C 220 114, 210 112, 200 112 
                 C 190 112, 180 114, 165 112 
                 C 155 116, 145 116, 142 108 Z"
              fill="url(#capGrad)"
              stroke="#ca8a04"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Shower cap ruffled brim */}
            <path
              d="M 144 105 Q 155 112 165 106 Q 175 112 188 106 Q 200 112 212 106 Q 225 112 235 106 Q 246 112 256 105"
              fill="none"
              stroke="#a16207"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Rubber Ducky Emblem on Cap */}
            <circle cx="200" cy="72" r="14" fill="#ffffff" stroke="#eab308" strokeWidth="2" />
            <g transform="translate(191, 64) scale(0.75)">
              <ellipse cx="12" cy="12" rx="9" ry="6" fill="#facc15" />
              <circle cx="17" cy="7" r="5" fill="#facc15" />
              <path d="M 21 7 L 25 8 L 21 10 Z" fill="#ea580c" />
              <circle cx="18" cy="6" r="1" fill="#000" />
            </g>
          </g>
        </g>

        {/* --- DIRT & MUD PATCHES --- */}
        {/* Render interactive dynamic dirt patches mapped from zones */}
        {zones.map((zone) => {
          if (zone.currentDirt <= 0.05) return null;
          // Scale mud spot based on remaining dirt
          const opacity = Math.min(1, zone.currentDirt * 0.95);
          const r = zone.radius * (0.4 + zone.currentDirt * 0.6);

          // SVG coordinates relative to 400x500 box
          const cx = (zone.x / 100) * 400;
          const cy = (zone.y / 100) * 500;

          return (
            <g key={`dirt-${zone.id}`} opacity={opacity}>
              {/* Irregular mud blob */}
              <ellipse
                cx={cx}
                cy={cy}
                rx={r}
                ry={r * 0.82}
                fill="url(#mudGrad)"
              />
              <path
                d={`M ${cx - r * 0.6} ${cy} 
                    Q ${cx - r * 0.2} ${cy - r * 0.8} ${cx + r * 0.3} ${cy - r * 0.6} 
                    Q ${cx + r * 0.9} ${cy} ${cx + r * 0.5} ${cy + r * 0.7} 
                    Q ${cx} ${cy + r * 0.8} ${cx - r * 0.7} ${cy + r * 0.3} Z`}
                fill="#451a03"
                opacity="0.75"
              />
              {/* Little mud speckles */}
              <circle cx={cx - r * 0.4} cy={cy - r * 0.3} r={r * 0.15} fill="#290f02" opacity="0.6" />
              <circle cx={cx + r * 0.35} cy={cy + r * 0.25} r={r * 0.12} fill="#290f02" opacity="0.6" />
              <circle cx={cx + r * 0.1} cy={cy - r * 0.45} r={r * 0.1} fill="#78350f" opacity="0.7" />
            </g>
          );
        })}

        {/* --- FOAM / SOAP BUBBLE CLUSTERS --- */}
        {zones.map((zone) => {
          if (zone.foamed <= 0.05) return null;
          const cx = (zone.x / 100) * 400;
          const cy = (zone.y / 100) * 500;
          const foamScale = zone.foamed;
          const bubbleOpacity = Math.min(1, zone.foamed * 1.2);

          return (
            <g key={`foam-${zone.id}`} opacity={bubbleOpacity} transform={`translate(${cx}, ${cy}) scale(${foamScale})`}>
              <circle cx="0" cy="0" r="18" fill="url(#bubbleGrad)" stroke="#bae6fd" strokeWidth="2" />
              <circle cx="-12" cy="-8" r="13" fill="url(#bubbleGrad)" stroke="#bae6fd" strokeWidth="1.8" />
              <circle cx="14" cy="-6" r="12" fill="url(#bubbleGrad)" stroke="#bae6fd" strokeWidth="1.8" />
              <circle cx="-8" cy="12" r="11" fill="url(#bubbleGrad)" stroke="#bae6fd" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="13" fill="url(#bubbleGrad)" stroke="#bae6fd" strokeWidth="1.5" />
              <circle cx="3" cy="-14" r="9" fill="url(#bubbleGrad)" stroke="#bae6fd" strokeWidth="1.5" />

              {/* Gloss shines */}
              <ellipse cx="-4" cy="-5" rx="4" ry="2" fill="#ffffff" opacity="0.8" />
              <ellipse cx="-15" cy="-11" rx="3" ry="1.5" fill="#ffffff" opacity="0.8" />
              <ellipse cx="12" cy="-9" rx="3" ry="1.5" fill="#ffffff" opacity="0.8" />
            </g>
          );
        })}

        {/* --- SWEAT DROPS (when hot & sweaty) --- */}
        {showSweat && (
          <g id="sweat-drops" className="animate-sweat">
            <path
              d="M 146 138 C 144 146, 140 152, 144 156 C 147 159, 151 156, 150 150 Z"
              fill="#38bdf8"
              opacity="0.85"
            />
            <path
              d="M 256 138 C 254 146, 250 152, 254 156 C 257 159, 261 156, 260 150 Z"
              fill="#38bdf8"
              opacity="0.85"
            />
            <path
              d="M 200 240 C 198 248, 194 254, 198 258 C 201 261, 205 258, 204 252 Z"
              fill="#38bdf8"
              opacity="0.85"
            />
          </g>
        )}

        {/* --- GREEN STINK FUMES (Mau Cheiro) --- */}
        {showStink && (
          <g id="stink-fumes">
            {/* Left armpit stink waves */}
            <g className="animate-stink" style={{ transformOrigin: '95px 235px' }}>
              <path
                d="M 90 235 Q 75 210 88 185 T 78 150"
                fill="none"
                stroke="#84cc16"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6,6"
                opacity="0.75"
              />
              <path
                d="M 102 245 Q 85 220 100 195 T 88 165"
                fill="none"
                stroke="#4ade80"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5,5"
                opacity="0.65"
              />
            </g>

            {/* Right armpit stink waves */}
            <g className="animate-stink" style={{ transformOrigin: '305px 235px', animationDelay: '0.8s' }}>
              <path
                d="M 310 235 Q 325 210 312 185 T 322 150"
                fill="none"
                stroke="#84cc16"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6,6"
                opacity="0.75"
              />
              <path
                d="M 298 245 Q 315 220 300 195 T 312 165"
                fill="none"
                stroke="#4ade80"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5,5"
                opacity="0.65"
              />
            </g>

            {/* Top head / torso stink cloud */}
            <g className="animate-stink" style={{ transformOrigin: '200px 160px', animationDelay: '1.4s' }}>
              <path
                d="M 190 170 Q 170 140 185 110 T 170 80"
                fill="none"
                stroke="#65a30d"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6,6"
                opacity="0.6"
              />
              <path
                d="M 215 170 Q 235 140 220 110 T 235 80"
                fill="none"
                stroke="#84cc16"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </g>
          </g>
        )}

        {/* --- SPARKLES & SHINE (WHEN VICTORY / SQUEAKY CLEAN) --- */}
        {isVictory && (
          <g id="victory-sparkles">
            {/* Sparkle 1 */}
            <g transform="translate(110, 160)" className="animate-sparkle">
              <path d="M 0 -16 Q 0 0 16 0 Q 0 0 0 16 Q 0 0 -16 0 Q 0 0 0 -16 Z" fill="#38bdf8" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
            </g>
            {/* Sparkle 2 */}
            <g transform="translate(290, 180)" className="animate-sparkle" style={{ animationDelay: '0.2s' }}>
              <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#facc15" />
              <circle cx="0" cy="0" r="5" fill="#ffffff" />
            </g>
            {/* Sparkle 3 (Belly) */}
            <g transform="translate(200, 310)" className="animate-sparkle" style={{ animationDelay: '0.4s' }}>
              <path d="M 0 -22 Q 0 0 22 0 Q 0 0 0 22 Q 0 0 -22 0 Q 0 0 0 -22 Z" fill="#ec4899" />
              <circle cx="0" cy="0" r="5" fill="#ffffff" />
            </g>
            {/* Sparkle 4 (Head) */}
            <g transform="translate(235, 90)" className="animate-sparkle" style={{ animationDelay: '0.3s' }}>
              <path d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z" fill="#38bdf8" />
            </g>
          </g>
        )}
      </svg>

      {/* --- CARTOON MOSQUINHAS (FLIES BUZZING) --- */}
      {showFlies && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {/* Fly 1 near left armpit */}
          <div className="absolute top-[38%] left-[10%] animate-fly-1">
            <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow">
              <ellipse cx="12" cy="14" rx="5" ry="6" fill="#1e293b" />
              <circle cx="12" cy="8" r="4" fill="#0f172a" />
              <circle cx="10" cy="7" r="1.5" fill="#ef4444" />
              <circle cx="14" cy="7" r="1.5" fill="#ef4444" />
              {/* Fluttering wings */}
              <ellipse cx="7" cy="11" rx="5" ry="2.5" fill="#e0f2fe" opacity="0.85" transform="rotate(-30 7 11)" />
              <ellipse cx="17" cy="11" rx="5" ry="2.5" fill="#e0f2fe" opacity="0.85" transform="rotate(30 17 11)" />
            </svg>
          </div>

          {/* Fly 2 near head/tummy */}
          <div className="absolute top-[22%] right-[14%] animate-fly-2">
            <svg width="20" height="20" viewBox="0 0 24 24" className="drop-shadow">
              <ellipse cx="12" cy="14" rx="4.5" ry="5.5" fill="#1e293b" />
              <circle cx="12" cy="8" r="3.5" fill="#0f172a" />
              <circle cx="10.5" cy="7" r="1.2" fill="#ef4444" />
              <circle cx="13.5" cy="7" r="1.2" fill="#ef4444" />
              <ellipse cx="7" cy="11" rx="4.5" ry="2" fill="#e0f2fe" opacity="0.85" transform="rotate(-35 7 11)" />
              <ellipse cx="17" cy="11" rx="4.5" ry="2" fill="#e0f2fe" opacity="0.85" transform="rotate(35 17 11)" />
            </svg>
          </div>

          {/* Fly 3 near right arm */}
          <div className="absolute top-[52%] right-[8%] animate-fly-1" style={{ animationDelay: '0.7s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" className="drop-shadow">
              <ellipse cx="12" cy="14" rx="4" ry="5" fill="#1e293b" />
              <circle cx="12" cy="9" r="3" fill="#0f172a" />
              <circle cx="11" cy="8" r="1" fill="#ef4444" />
              <circle cx="13" cy="8" r="1" fill="#ef4444" />
              <ellipse cx="8" cy="11" rx="4" ry="2" fill="#e0f2fe" opacity="0.8" transform="rotate(-25 8 11)" />
              <ellipse cx="16" cy="11" rx="4" ry="2" fill="#e0f2fe" opacity="0.8" transform="rotate(25 16 11)" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
