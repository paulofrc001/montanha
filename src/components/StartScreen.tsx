import React from 'react';
import { sounds } from '../audio';
import { Play, Sparkles } from 'lucide-react';

interface StartScreenProps {
  onStartPhase1: (seconds: number) => void;
  onStartPhase2: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartPhase1, onStartPhase2 }) => {
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

        <p className="text-xs sm:text-sm font-bold text-sky-700 mt-1 max-w-xs">
          O grandalhão mais simpático e engraçado dos games! Escolha uma das fases abaixo para jogar:
        </p>

        {/* Phase Selection Cards */}
        <div className="w-full flex flex-col gap-3 my-4">
          {/* Phase 1 Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onStartPhase1(65);
            }}
            className="w-full p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 flex items-center justify-between text-left transition active:scale-98 cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform">🧼</span>
              <div>
                <span className="text-xs font-black text-sky-600 uppercase tracking-wide block">Fase 1</span>
                <span className="text-sm font-black text-sky-950">Pega o Montanha!</span>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">Ele não quer banho: desvia, protege a pança e solta pum!</p>
              </div>
            </div>
            <Play className="w-5 h-5 text-sky-600 fill-current shrink-0" />
          </button>

          {/* Phase 2 Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onStartPhase2();
            }}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-lime-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 border-2 border-lime-500 flex items-center justify-between text-left transition active:scale-98 cursor-pointer shadow-md group relative overflow-hidden ring-2 ring-lime-400/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform">🏃💨</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">Fase 2</span>
                  <span className="bg-lime-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">NOVA!</span>
                </div>
                <span className="text-sm font-black text-slate-900">Fuga do Banho!</span>
                <p className="text-[11px] font-semibold text-slate-600 leading-tight">Desvie dos jatos d'água, use o Gás Turbo e fique sujo o maior tempo possível!</p>
              </div>
            </div>
            <Play className="w-5 h-5 text-emerald-600 fill-current shrink-0" />
          </button>
        </div>

        <p className="text-[11px] font-semibold text-slate-400">
          💡 Compatível com computador e celular (mouse, teclado e toque na tela)
        </p>
      </div>
    </div>
  );
};
