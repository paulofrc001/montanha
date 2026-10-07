import React, { useEffect } from 'react';
import { sounds } from '../audio';
import { RotateCcw, Frown } from 'lucide-react';

interface GameOverModalProps {
  overallDirt: number;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  overallDirt,
  onRetry,
}) => {
  useEffect(() => {
    sounds.playGameOver();
  }, []);

  const cleanliness = Math.round(100 - overallDirt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-4 border-rose-400 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Stinky / Sad Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-3xl mb-3 shadow-md -mt-2 animate-bounce">
          🦨
        </div>

        <h2 className="text-2xl font-black text-rose-950 tracking-tight">
          O Tempo Acabou!
        </h2>
        <p className="text-sm font-semibold text-rose-800 mt-1">
          O Montanha continuou com inhaca e as mosquinhas venceram!
        </p>

        {/* Cleanliness reached */}
        <div className="w-full bg-rose-50 rounded-2xl border-2 border-rose-200 p-3 my-4 flex items-center justify-between text-xs font-bold text-rose-900">
          <span>Higiene alcançada:</span>
          <span className="text-sm font-extrabold">{cleanliness}% Limpo</span>
        </div>

        <blockquote className="bg-slate-100 text-slate-700 font-bold text-xs italic px-3 py-2 rounded-xl border border-slate-200 mb-5">
          “Caramba, o sabonete escorregou da mão e fiquei na sujeira... Vamos de novo?”
        </blockquote>

        <button
          onClick={() => {
            sounds.playClick();
            onRetry();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-base shadow-lg shadow-rose-400/40 border-2 border-rose-600 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          Tentar Novamente!
        </button>
      </div>
    </div>
  );
};
