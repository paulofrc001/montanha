import React from 'react';
import { sounds } from '../audio';
import { Play, Sparkles } from 'lucide-react';

interface StartScreenProps {
  onStart: (seconds: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/50 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-4 border-sky-400 p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Background bubbles decoration */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-200/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-200/50 rounded-full blur-xl pointer-events-none" />

        {/* Mascot Avatar Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-amber-500 shadow-lg flex items-center justify-center text-4xl mb-3 rotate-[-3deg] animate-bounce">
          🛁
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-sky-950 tracking-tight">
          Limpa o Montanha!
        </h1>

        <p className="text-sm font-bold text-sky-700 mt-1 max-w-xs">
          O Montanha chegou do futebol sujo, suado e com as mosquinhas na cola. Ajude-o a ficar cheiroso antes do tempo acabar!
        </p>

        {/* 4 Steps Guide */}
        <div className="w-full bg-sky-50 rounded-2xl border-2 border-sky-200 p-3.5 my-4 flex flex-col gap-2 text-left">
          <span className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Como Jogar (4 Etapas):
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-2">
              <span className="text-lg">🧼</span>
              <span>1. Passe sabonete</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-2">
              <span className="text-lg">🧽</span>
              <span>2. Esfregue bucha</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-2">
              <span className="text-lg">🚿</span>
              <span>3. Enxágue água</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-2">
              <span className="text-lg">🧴</span>
              <span>4. Desodorante 48h</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onStart(60);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg shadow-emerald-400/40 border-2 border-emerald-600 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <Play className="w-6 h-6 fill-current" />
          Começar o Banho! (60s)
        </button>

        <p className="text-[11px] font-semibold text-slate-400 mt-3">
          💡 Clique e arraste o mouse ou o dedo sobre o corpo do Montanha
        </p>
      </div>
    </div>
  );
};
