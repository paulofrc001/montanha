import React from 'react';
import { getZoneFromMeters } from './Fase2ParallaxBackground';
import { Volume2, VolumeX, RotateCcw, ArrowUp, ArrowDown, Zap, Home } from 'lucide-react';

interface Fase2HUDProps {
  distanceMeters: number;
  score: number;
  coins: number;
  pursuerDistance: number; // 0 to 100 meters
  turboMeter: number; // 0 to 100%
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onJump: () => void;
  onDuckStart: () => void;
  onDuckEnd: () => void;
  onTriggerTurbo: () => void;
  onBackToMenu: () => void;
}

export const Fase2HUD: React.FC<Fase2HUDProps> = ({
  distanceMeters,
  score,
  coins,
  pursuerDistance,
  turboMeter,
  isMuted,
  onToggleMute,
  onRestart,
  onJump,
  onDuckStart,
  onDuckEnd,
  onTriggerTurbo,
  onBackToMenu,
}) => {
  const { name, icon } = getZoneFromMeters(distanceMeters);
  const isTurboReady = turboMeter >= 100;
  const isPursuerClose = pursuerDistance <= 25;

  return (
    <div className="absolute inset-x-0 top-0 z-30 select-none p-3 flex flex-col gap-2">
      {/* Top Header: Title, Stats, Controls */}
      <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto w-full">
        {/* Left: Back to Menu & Phase Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onBackToMenu}
            title="Voltar ao Menu"
            className="w-8 h-8 rounded-xl bg-white/90 border border-slate-300 hover:bg-white flex items-center justify-center text-slate-700 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="bg-white/95 px-3 py-1 rounded-2xl border-2 border-amber-400 shadow-sm flex items-center gap-1.5">
            <span className="text-base">{icon}</span>
            <div className="leading-tight">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 block">
                Fase 2: Fuga!
              </span>
              <span className="text-xs font-bold text-slate-800">
                {name} ({Math.round(distanceMeters)}m / 500m)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Score & Coins */}
        <div className="flex items-center gap-2">
          {/* Coins / Ducks */}
          <div className="bg-white/90 px-2.5 py-1 rounded-xl border border-sky-300 shadow-sm flex items-center gap-1 text-xs font-black text-amber-700">
            <span>🦆</span>
            <span>{coins}</span>
          </div>

          {/* Points */}
          <div className="bg-white/90 px-2.5 py-1 rounded-xl border border-sky-300 shadow-sm flex items-center gap-1 text-xs font-black text-sky-900">
            <span>⭐</span>
            <span>{score} pts</span>
          </div>
        </div>

        {/* Right: Sound & Restart */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            className="w-8 h-8 rounded-xl bg-white/90 border border-slate-300 hover:bg-white flex items-center justify-center text-slate-700 shadow-sm transition active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onRestart}
            title="Reiniciar Corrida"
            className="w-8 h-8 rounded-xl bg-white/90 border border-slate-300 hover:bg-white flex items-center justify-center text-slate-700 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gauges Bar: Pursuer Distance & Turbo Gas */}
      <div className="max-w-3xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Pursuer Distance Meter */}
        <div className={`p-2 rounded-2xl border-2 shadow-sm transition-colors ${
          isPursuerClose ? 'bg-rose-50/95 border-rose-500 animate-pulse' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex justify-between items-center text-[11px] font-black text-slate-700 mb-1">
            <span className="flex items-center gap-1">
              🚿 <span>Perseguidor com Chuveirinho</span>
            </span>
            <span className={isPursuerClose ? 'text-rose-600 font-extrabold' : 'text-slate-600'}>
              {Math.round(pursuerDistance)}m de distância
            </span>
          </div>
          <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            {/* Pursuer bar indicator */}
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isPursuerClose
                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                  : 'bg-gradient-to-r from-sky-400 to-emerald-400'
              }`}
              style={{ width: `${Math.max(5, pursuerDistance)}%` }}
            />
          </div>
        </div>

        {/* GÁS TURBO Meter */}
        <div className={`p-2 rounded-2xl border-2 shadow-sm flex items-center gap-2 transition-all ${
          isTurboReady
            ? 'bg-gradient-to-r from-lime-100 to-emerald-100 border-lime-500 shadow-lime-300/60 ring-2 ring-lime-400'
            : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex-1">
            <div className="flex justify-between items-center text-[11px] font-black text-slate-800 mb-1">
              <span className="flex items-center gap-1 text-emerald-800">
                💨 <span>GÁS TURBO:</span>
              </span>
              <span className="text-emerald-700">{Math.round(turboMeter)}%</span>
            </div>
            <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-lime-400 via-lime-500 to-emerald-500 rounded-full transition-all duration-150"
                style={{ width: `${turboMeter}%` }}
              />
            </div>
          </div>

          {/* Quick Activate Turbo button */}
          <button
            onClick={onTriggerTurbo}
            disabled={!isTurboReady}
            className={`px-3 py-1.5 rounded-xl font-black text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
              isTurboReady
                ? 'bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 text-white shadow-md animate-bounce ring-2 ring-lime-400'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            TURBO!
          </button>
        </div>
      </div>

      {/* MOBILE TOUCH CONTROLS OVERLAY (Fixed at bottom for easy thumb access) */}
      <div className="fixed bottom-3 inset-x-0 px-4 max-w-lg mx-auto flex justify-between items-end pointer-events-none z-40">
        {/* Left Hand: Duck / Abaixar button */}
        <button
          onPointerDown={onDuckStart}
          onPointerUp={onDuckEnd}
          onPointerLeave={onDuckEnd}
          className="pointer-events-auto w-20 h-20 rounded-3xl bg-amber-400/90 active:bg-amber-500 border-4 border-amber-600 shadow-xl flex flex-col items-center justify-center text-amber-950 font-black text-xs active:scale-90 transition-transform touch-none select-none backdrop-blur-xs"
        >
          <ArrowDown className="w-8 h-8 stroke-[3]" />
          <span>ABAIXAR</span>
        </button>

        {/* Center: Turbo Blast Button (Mobile accessible) */}
        {isTurboReady && (
          <button
            onClick={onTriggerTurbo}
            className="pointer-events-auto px-4 py-3 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-600 border-3 border-lime-700 shadow-xl flex items-center gap-1.5 text-white font-black text-xs animate-bounce active:scale-95 transition-transform"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>SOLTAR TURBO! 💨</span>
          </button>
        )}

        {/* Right Hand: Jump / Pular button */}
        <button
          onClick={onJump}
          className="pointer-events-auto w-20 h-20 rounded-3xl bg-sky-400/90 active:bg-sky-500 border-4 border-sky-600 shadow-xl flex flex-col items-center justify-center text-sky-950 font-black text-xs active:scale-90 transition-transform touch-none select-none backdrop-blur-xs"
        >
          <ArrowUp className="w-8 h-8 stroke-[3]" />
          <span>PULAR</span>
        </button>
      </div>
    </div>
  );
};
