import React from 'react';
import { WaterAttack } from '../../types';

interface WaterAttacksLayerProps {
  attacks: WaterAttack[];
  floatingTexts: { id: number; text: string; x: number; y: number; color: string }[];
}

export const WaterAttacksLayer: React.FC<WaterAttacksLayerProps> = ({
  attacks,
  floatingTexts,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Active Projectiles */}
      {attacks.map((att) => {
        if (!att.active) return null;

        return (
          <div
            key={att.id}
            className="absolute transition-none"
            style={{
              left: `${att.x}px`,
              top: `${att.y}px`,
              width: `${att.width}px`,
              height: `${att.height}px`,
            }}
          >
            {att.type === 'hose_low' && (
              <svg viewBox="0 0 100 24" className="w-full h-full drop-shadow">
                <path
                  d="M 0 12 Q 50 6 100 12"
                  stroke="#38bdf8"
                  strokeWidth="14"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 0 12 Q 50 8 100 12"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />
              </svg>
            )}

            {att.type === 'hose_high' && (
              <svg viewBox="0 0 100 24" className="w-full h-full drop-shadow">
                <path
                  d="M 0 12 Q 50 16 100 12"
                  stroke="#0284c7"
                  strokeWidth="15"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 0 12 Q 50 14 100 12"
                  stroke="#7dd3fc"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />
              </svg>
            )}

            {att.type === 'water_gun' && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl animate-pulse">💧</span>
              </div>
            )}

            {att.type === 'bucket_lob' && (
              <svg viewBox="0 0 50 45" className="w-full h-full drop-shadow animate-spin">
                <polygon points="10,8 40,8 35,40 15,40" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                <ellipse cx="25" cy="8" rx="15" ry="4" fill="#38bdf8" />
                <path d="M 0 25 Q 25 15 50 25" stroke="#7dd3fc" strokeWidth="4" fill="none" />
              </svg>
            )}

            {att.type === 'super_jet' && (
              <svg viewBox="0 0 120 36" className="w-full h-full drop-shadow-xl animate-pulse">
                <rect x="0" y="4" width="120" height="28" rx="14" fill="#0284c7" />
                <rect x="10" y="8" width="100" height="20" rx="10" fill="#38bdf8" />
                <rect x="20" y="12" width="80" height="12" rx="6" fill="#ffffff" />
              </svg>
            )}
          </div>
        );
      })}

      {/* Floating text messages (+8% LIMPEZA, DESVIO PERFEITO!) */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="absolute font-black text-sm drop-shadow-md animate-bounce pointer-events-none transition-all duration-500"
          style={{
            left: `${ft.x}px`,
            top: `${ft.y}px`,
            color: ft.color,
          }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  );
};
