import React from 'react';
import { getZoneFromMeters } from './Fase2ParallaxBackground';
import { Volume2, VolumeX, RotateCcw, ArrowUp, ArrowDown, Zap, Home } from 'lucide-react';

interface Fase2HUDProps {
  cleanLevel: number; // 0 to 100%
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
  cleanLevel,
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
  const isDangerouslyClean = cleanLevel >= 75;

  return (
    <div className="absolute inset-x-0 top-0 z-30 select-none p-2 sm:p-3 flex flex-col gap-2">
      {/* Top Header: Title, Stats, Controls */}
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
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
                Fase 2: Fuga do Banho!
              </span>
              <span className="text-xs font-bold text-slate-800">
                {name} ({Math.round(distanceMeters)}m)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Score & Ducks */}
        <div className="flex items-center gap-2">
          {/* Ducks */}
          <div className="bg-white/90 px-2.5 py-1 rounded-xl border border-amber-300 shadow-sm flex items-center gap-1 text-xs font-black text-amber-700">
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

      {/* MAIN GAUGES: BARRA DE LIMPEZA (CORE GOAL: STAY DIRTY!) + PURSUER & TURBO */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* 1. BARRA DE LIMPEZA (0% a 100%) */}
        <div
          className={`p-2 rounded-2xl border-2 shadow-sm transition-all sm:col-span-1 ${
            isDangerouslyClean
              ? 'bg-rose-100/95 border-rose-500 ring-2 ring-rose-400 animate-pulse'
              : 'bg-white/95 border-amber-300'
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-black mb-1">
            <span className="flex items-center gap-1 text-slate-800">
              🧼 <span>NÍVEL DE LIMPEZA:</span>
            </span>
            <span
              className={
                isDangerouslyClean
                  ? 'text-rose-700 font-black text-xs'
                  : 'text-amber-800 font-black'
              }
            >
              {Math.round(cleanLevel)}% {isDangerouslyClean ? '⚠️ QUASE LIMPO!' : '(Fique sujo!)'}
            </span>
          </div>

          <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            {/* Dirt/clean bar */}
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isDangerouslyClean
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-red-600'
                  : 'bg-gradient-to-r from-emerald-500 via-sky-400 to-blue-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, cleanLevel))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 mt-0.5">
            <span>0% (100% Sujo 🦨)</span>
            <span>100% (Fim de Jogo 🛁)</span>
          </div>
        </div>

        {/* 2. PURSUER DISTANCE METER */}
        <div
          className={`p-2 rounded-2xl border-2 shadow-sm transition-colors ${
            isPursuerClose
              ? 'bg-rose-50/95 border-rose-500 animate-pulse'
              : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="flex justify-between items-center text-[11px] font-black text-slate-700 mb-1">
            <span className="flex items-center gap-1">
              🚿 <span>Perseguidor com Água</span>
            </span>
            <span className={isPursuerClose ? 'text-rose-600 font-extrabold' : 'text-slate-600'}>
              {Math.round(pursuerDistance)}m atrás
            </span>
          </div>
          <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isPursuerClose
                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                  : 'bg-gradient-to-r from-sky-400 to-emerald-400'
              }`}
              style={{ width: `${Math.max(5, pursuerDistance)}%` }}
            />
          </div>
          <div className="text-[9px] font-bold text-slate-500 mt-0.5 text-right">
            {isPursuerClose ? 'Cuidado! Jatos frequentes!' : 'Distância segura'}
          </div>
        </div>

        {/* 3. GÁS TURBO METER */}
        <div
          className={`p-2 rounded-2xl border-2 shadow-sm flex items-center gap-2 transition-all ${
            isTurboReady
              ? 'bg-gradient-to-r from-lime-100 to-emerald-100 border-lime-500 shadow-lime-300/60 ring-2 ring-lime-400'
              : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="flex-1">
            <div className="flex justify-between items-center text-[11px] font-black text-slate-800 mb-1">
              <span className="flex items-center gap-1 text-emerald-800">
                💨 <span>GÁS TURBO:</span>
              </span>
              <span className="text-emerald-700 font-black">{Math.round(turboMeter)}%</span>
            </div>
            <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-lime-400 via-lime-500 to-emerald-500 rounded-full transition-all duration-150"
                style={{ width: `${turboMeter}%` }}
              />
            </div>
            <div className="text-[9px] font-bold text-emerald-700 mt-0.5">
              {isTurboReady ? 'PRONTO PARA SOLTAR! 🚀' : 'Enchendo na corrida...'}
            </div>
          </div>

          <button
            onClick={onTriggerTurbo}
            disabled={!isTurboReady}
            className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
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

      {/* Desktop Controls Quick Reminder */}
      <div className="hidden sm:flex justify-center items-center gap-3 text-[11px] font-bold text-slate-700 bg-white/70 px-3 py-1 rounded-xl max-w-xl mx-auto shadow-xs border border-slate-200/80">
        <span>🎮 Teclado:</span>
        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">ESPAÇO / ↑ Pular</span>
        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">↓ Abaixar</span>
        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">← Reduzir</span>
        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">→ Acelerar</span>
        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">T Turbo</span>
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
        {isTurboReady ? (
          <button
            onClick={onTriggerTurbo}
            className="pointer-events-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-600 border-3 border-lime-700 shadow-xl flex items-center gap-2 text-white font-black text-xs animate-bounce active:scale-95 transition-transform"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>SOLTAR TURBO! 💨</span>
          </button>
        ) : (
          <div className="bg-black/40 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-white/20">
            Turbo: {Math.round(turboMeter)}%
          </div>
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
