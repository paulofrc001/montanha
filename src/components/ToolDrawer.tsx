import React from 'react';
import { GameStage, ToolDef } from '../types';
import { sounds } from '../audio';
import { Sparkles } from 'lucide-react';

interface ToolDrawerProps {
  currentStage: GameStage;
  onSelectStage: (stage: GameStage) => void;
  stageProgress: number;
}

const TOOLS: ToolDef[] = [
  {
    id: 'SOAP',
    name: '1. Sabão',
    icon: '🧼',
    color: 'from-pink-400 to-rose-500',
    desc: 'Ensaboar o corpo',
    actionText: 'Arraste o sabonete enquanto o Montanha tenta desviar!',
  },
  {
    id: 'SCRUB',
    name: '2. Bucha',
    icon: '🧽',
    color: 'from-amber-400 to-yellow-500',
    desc: 'Esfregar a sujeira',
    actionText: 'Esfregue as manchas! Cuidado que ele tenta proteger a pança!',
  },
  {
    id: 'RINSE',
    name: '3. Água',
    icon: '🚿',
    color: 'from-sky-400 to-blue-500',
    desc: 'Enxaguar espuma',
    actionText: 'Direcione a água para enxaguar a espuma antes que ele fuja!',
  },
  {
    id: 'TOWEL',
    name: '4. Toalha',
    icon: '🧣',
    color: 'from-yellow-400 to-amber-500',
    desc: 'Secar o corpo',
    actionText: 'Passe a toalha para secar as dobras enquanto ele se sacode!',
  },
  {
    id: 'DEODORANT',
    name: '5. Desodor.',
    icon: '🧴',
    color: 'from-emerald-400 to-teal-500',
    desc: 'Desodorante 48h',
    actionText: 'Aplique o desodorante nos suvacos para vencer a partida!',
  },
];

export const ToolDrawer: React.FC<ToolDrawerProps> = ({
  currentStage,
  onSelectStage,
  stageProgress,
}) => {
  const activeTool = TOOLS.find((t) => t.id === currentStage) || TOOLS[0];

  return (
    <footer className="w-full max-w-xl mx-auto px-4 pb-4 pt-1 z-30 select-none flex flex-col gap-2">
      {/* Current Instruction Banner */}
      <div className="bg-sky-900/90 text-white px-3.5 py-2 rounded-2xl border-2 border-sky-400 shadow-lg flex items-center justify-between gap-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xl animate-bounce">{activeTool.icon}</span>
          <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
            {activeTool.actionText}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-sky-800/80 px-2 py-1 rounded-xl border border-sky-400/50">
          <span className="text-[10px] font-bold text-sky-200">Etapa:</span>
          <span className="text-xs font-black text-amber-300">
            {Math.round(stageProgress)}%
          </span>
        </div>
      </div>

      {/* 5 Interactive Tool Buttons */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {TOOLS.map((tool) => {
          const isActive = currentStage === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                sounds.playClick();
                onSelectStage(tool.id);
              }}
              className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
                isActive
                  ? 'bg-white border-sky-500 shadow-sky-300/50 ring-3 ring-sky-300/40 -translate-y-1'
                  : 'bg-white/90 hover:bg-white border-slate-200 hover:border-sky-300 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Active Sparkle Badge */}
              {isActive && (
                <div className="absolute -top-1.5 -right-1 bg-amber-400 text-sky-950 rounded-full p-0.5 border border-amber-600 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Tool Icon with cartoon background badge */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl sm:text-2xl shadow-inner border border-white/50 mb-1 transform group-hover:scale-105 transition-transform`}
              >
                {tool.icon}
              </div>

              {/* Tool Name */}
              <span
                className={`text-[10px] sm:text-xs font-extrabold tracking-tight leading-none text-center truncate w-full ${
                  isActive ? 'text-sky-950 font-black' : 'text-slate-700'
                }`}
              >
                {tool.name}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};
