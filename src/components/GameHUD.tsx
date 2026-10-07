import React from 'react';
import { GameStage } from '../types';
import { Volume2, VolumeX, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface GameHUDProps {
  overallDirt: number; // 0 to 100
  timeLeft: number;
  stage: GameStage;
  stageProgress: number; // 0 to 100
  dodgesCount: number;
  fartsCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onSwitchPhase2?: () => void;
}

const STAGES_LIST: { id: GameStage; name: string; icon: string; short: string }[] = [
  { id: 'SOAP', name: 'Passar Sabonete', icon: '🧼', short: '1. Sabão' },
  { id: 'SCRUB', name: 'Esfregar Bucha', icon: '🧽', short: '2. Bucha' },
  { id: 'RINSE', name: 'Enxaguar Água', icon: '🚿', short: '3. Água' },
  { id: 'TOWEL', name: 'Secar com Toalha', icon: '🧣', short: '4. Toalha' },
  { id: 'DEODORANT', name: 'Desodorante 48h', icon: '🧴', short: '5. Desodor.' },
];

export const GameHUD: React.FC<GameHUDProps> = ({
  overallDirt,
  timeLeft,
  stage,
  stageProgress,
  dodgesCount,
  fartsCount,
  isMuted,
  onToggleMute,
  onRestart,
  onSwitchPhase2,
}) => {
  const currentStageIndex = STAGES_LIST.findIndex((s) => s.id === stage);

  // Cleanliness level (inverse of dirt)
  const cleanliness = Math.round(100 - overallDirt);

  // Time format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isLowTime = timeLeft <= 15;

  return (
    <header className="w-full max-w-2xl mx-auto px-4 pt-3 pb-2 flex flex-col gap-2 z-30 select-none">
      {/* Top Bar: Title & Quick Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-xl shadow-sm rotate-[-4deg]">
            🧼
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-sky-950 tracking-tight leading-none">
              Pega o Montanha!
            </h1>
            <p className="text-xs text-sky-700 font-semibold">
              Ele não quer tomar banho e foge do sabão!
            </p>
          </div>
        </div>

        {/* Right Actions: Phase 2 shortcut, Timer, Sound & Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onSwitchPhase2 && (
            <button
              onClick={onSwitchPhase2}
              title="Jogar Fase 2: Fuga do Banho"
              className="px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1 active:scale-95 transition cursor-pointer"
            >
              <span>🏃💨</span>
              <span className="hidden sm:inline">Fase 2!</span>
            </button>
          )}

          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 font-bold text-sm shadow-sm transition-colors ${
              isLowTime
                ? 'bg-rose-100 border-rose-500 text-rose-700 animate-pulse'
                : 'bg-white border-sky-300 text-sky-900'
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-sky-600'}`} />
            <span className="tabular-nums tracking-wide">{timeFormatted}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            className="w-9 h-9 rounded-2xl bg-white border-2 border-sky-300 hover:border-sky-400 flex items-center justify-center text-sky-700 hover:text-sky-900 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            aria-label="Reiniciar partida"
            title="Reiniciar"
            className="w-9 h-9 rounded-2xl bg-white border-2 border-sky-300 hover:border-sky-400 flex items-center justify-center text-sky-700 hover:text-sky-900 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dirt & Stink Bar + Dodges & Farts Counters */}
      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border-2 border-sky-200 shadow-sm flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold flex-wrap gap-1">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span>{overallDirt > 25 ? '🦨 Mau Cheiro:' : '✨ Higiene:'}</span>
            <span className={overallDirt > 25 ? 'text-amber-800' : 'text-emerald-700 font-extrabold'}>
              {overallDirt > 0 ? `${Math.round(overallDirt)}% de sujeira` : '100% Cheiroso!'}
            </span>
          </div>

          {/* Dodges & Farts Counter Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300 font-black">
              🏃‍♂️ Desvios: {dodgesCount}
            </span>
            <span className="bg-lime-100 text-lime-900 px-2 py-0.5 rounded-lg border border-lime-300 font-black">
              💨 Puns: {fartsCount}
            </span>
            <span className="text-sky-700 flex items-center gap-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {cleanliness}% Limpo
            </span>
          </div>
        </div>

        {/* Dirt Progress Track */}
        <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
          <div
            className={`h-full transition-all duration-300 rounded-full flex items-center justify-end pr-1 ${
              overallDirt > 50
                ? 'bg-gradient-to-r from-lime-600 via-lime-500 to-amber-700'
                : overallDirt > 20
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-sky-400'
                : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
            }`}
            style={{ width: `${Math.max(4, overallDirt)}%` }}
          >
            <span className="text-[10px] leading-none text-white/90 drop-shadow">
              {overallDirt > 25 ? '💨' : '🫧'}
            </span>
          </div>
        </div>
      </div>

      {/* 5 Steps Segmented Indicator */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
        {STAGES_LIST.map((s, index) => {
          const isDone = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <div
              key={s.id}
              className={`py-1.5 px-1 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                isCurrent
                  ? 'bg-sky-500 border-sky-600 text-white shadow-md scale-[1.02]'
                  : isDone
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  : 'bg-white/70 border-slate-200 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold leading-tight">
                <span>{isDone ? '✅' : s.icon}</span>
                <span className="hidden sm:inline">{s.short}</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5 opacity-90 truncate w-full">
                {isDone ? 'Concluído' : isCurrent ? `${Math.round(stageProgress)}%` : `Etapa ${index + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </header>
  );
};
