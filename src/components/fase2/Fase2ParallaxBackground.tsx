import React, { memo } from 'react';
import { DomesticZone } from '../../types';

interface Fase2ParallaxBackgroundProps {
  distanceMeters: number;
  isTurbo?: boolean;
}

export const getZoneFromMeters = (meters: number): { zone: DomesticZone; name: string; icon: string } => {
  if (meters < 100) return { zone: 'bathroom', name: 'Banheiro', icon: '🛁' };
  if (meters < 200) return { zone: 'hallway', name: 'Corredor', icon: '🚪' };
  if (meters < 300) return { zone: 'living_room', name: 'Sala de Estar', icon: '🛋️' };
  if (meters < 420) return { zone: 'kitchen', name: 'Cozinha', icon: '🍽️' };
  return { zone: 'backyard', name: 'Quintal', icon: '🌳' };
};

export const Fase2ParallaxBackground: React.FC<Fase2ParallaxBackgroundProps> = memo(({
  distanceMeters,
  isTurbo = false,
}) => {
  const { zone, name, icon } = getZoneFromMeters(distanceMeters);

  // Background colors per zone
  const getThemeStyles = () => {
    switch (zone) {
      case 'bathroom':
        return {
          bg: 'bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100',
          floor: 'bg-sky-400 border-t-4 border-sky-600',
          decor: '🚿 🛁 🧼 🪥',
        };
      case 'hallway':
        return {
          bg: 'bg-gradient-to-b from-amber-200 via-orange-100 to-amber-50',
          floor: 'bg-amber-700 border-t-4 border-amber-900',
          decor: '🚪 🖼️ 💡 🚪',
        };
      case 'living_room':
        return {
          bg: 'bg-gradient-to-b from-teal-200 via-emerald-100 to-slate-100',
          floor: 'bg-stone-500 border-t-4 border-stone-700',
          decor: '🛋️ 📺 🪴 🪟',
        };
      case 'kitchen':
        return {
          bg: 'bg-gradient-to-b from-yellow-200 via-orange-100 to-amber-100',
          floor: 'bg-orange-300 border-t-4 border-orange-500',
          decor: '🧊 🍳 🍽️ 🫖',
        };
      case 'backyard':
        return {
          bg: 'bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200',
          floor: 'bg-emerald-600 border-t-4 border-emerald-800',
          decor: '🌳 🏡 🌷 ☀️',
        };
    }
  };

  const theme = getThemeStyles();
  const decorItems = theme.decor.split(' ');

  return (
    <div className={`absolute inset-0 select-none overflow-hidden transition-colors duration-1000 ${theme.bg}`}>
      {/* Upper Ceiling / Sky Details */}
      <div className="absolute top-2 left-0 right-0 flex justify-between px-6 opacity-40 text-sm font-bold text-slate-700 pointer-events-none">
        <span>Fuga do Banho!</span>
        <span className="flex items-center gap-1">
          {icon} <strong>{name}</strong>
        </span>
      </div>

      {/* Far Background Parallax Layer with continuous GPU CSS animation */}
      <div
        className={`absolute top-8 left-0 w-[1200px] h-32 flex items-center justify-around opacity-30 text-3xl pointer-events-none ${
          isTurbo ? 'anim-scroll-far-turbo' : 'anim-scroll-far'
        }`}
      >
        <span>{decorItems[0]}</span>
        <span>{decorItems[1]}</span>
        <span>{decorItems[2]}</span>
        <span>{decorItems[3]}</span>
        <span>{decorItems[0]}</span>
        <span>{decorItems[1]}</span>
      </div>

      {/* Midground Domestic Wall Elements with continuous GPU CSS animation */}
      <div
        className={`absolute bottom-28 left-0 w-[1200px] h-28 flex items-center justify-around opacity-45 text-4xl pointer-events-none ${
          isTurbo ? 'anim-scroll-mid-turbo' : 'anim-scroll-mid'
        }`}
      >
        <span>{decorItems[1]}</span>
        <span>{decorItems[3]}</span>
        <span>{decorItems[0]}</span>
        <span>{decorItems[2]}</span>
        <span>{decorItems[1]}</span>
        <span>{decorItems[3]}</span>
      </div>

      {/* Floor / Ground */}
      <div className={`absolute bottom-0 left-0 right-0 h-16 ${theme.floor} shadow-inner z-0`}>
        {/* Floor Pattern Strip */}
        <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,rgba(255,255,255,0.4)_15px,rgba(255,255,255,0.4)_30px)]" />
      </div>
    </div>
  );
}, (prev, next) => {
  // Only re-render when zone or turbo state changes
  const prevZone = getZoneFromMeters(prev.distanceMeters).zone;
  const nextZone = getZoneFromMeters(next.distanceMeters).zone;
  return prevZone === nextZone && prev.isTurbo === next.isTurbo;
});

Fase2ParallaxBackground.displayName = 'Fase2ParallaxBackground';
