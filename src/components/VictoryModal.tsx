import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio';
import { Star, RotateCcw, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  timeLeft: number;
  totalTime: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  timeLeft,
  totalTime,
  onPlayAgain,
}) => {
  // Determine star rating (1 to 3)
  const timeUsed = totalTime - timeLeft;
  let stars = 3;
  let rankTitle = 'Mestre dos Banhos!';

  if (timeLeft < 12) {
    stars = 1;
    rankTitle = 'Limpador no Sufoco!';
  } else if (timeLeft < 25) {
    stars = 2;
    rankTitle = 'Especialista em Espuma!';
  }

  // Trigger confetti burst on open
  useEffect(() => {
    sounds.playVictory();

    // Fire confetti cannons from both sides
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#38bdf8', '#facc15', '#ec4899', '#4ade80', '#a855f7'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#38bdf8', '#facc15', '#ec4899', '#4ade80', '#a855f7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-4 border-amber-400 p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Decorative background sunburst */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Victory Header Badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-amber-500 shadow-md flex items-center justify-center text-3xl mb-3 -mt-2 animate-bounce">
          🏆
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">
          Montanha Tá Cheiroso!
        </h2>
        <p className="text-sm font-semibold text-sky-700 mt-1">
          {rankTitle} O grandalhão está limpinho da cabeça aos pés!
        </p>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-2 my-5">
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= stars;
            return (
              <div
                key={starIndex}
                className={`relative transform transition-transform duration-500 hover:scale-110 ${
                  starIndex === 2 ? '-translate-y-2' : ''
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-amber-300 to-yellow-500 border-amber-600 shadow-lg text-white scale-100'
                      : 'bg-slate-100 border-slate-300 text-slate-300 scale-90'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 fill-current ${
                      isEarned ? 'text-white drop-shadow' : 'text-slate-300'
                    }`}
                  />
                </div>
                {isEarned && (
                  <span className="absolute -top-1 -right-1 text-xs">✨</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Game Stats Card */}
        <div className="w-full bg-sky-50 rounded-2xl border-2 border-sky-200 p-3.5 mb-5 flex items-center justify-around text-xs sm:text-sm">
          <div className="flex flex-col items-center">
            <span className="text-slate-500 font-semibold">Tempo Restante</span>
            <span className="text-base sm:text-lg font-black text-sky-900">
              {timeLeft}s
            </span>
          </div>

          <div className="w-px h-8 bg-sky-200" />

          <div className="flex flex-col items-center">
            <span className="text-slate-500 font-semibold">Tempo de Banho</span>
            <span className="text-base sm:text-lg font-black text-sky-900">
              {timeUsed}s
            </span>
          </div>

          <div className="w-px h-8 bg-sky-200" />

          <div className="flex flex-col items-center">
            <span className="text-slate-500 font-semibold">Higiene Final</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 100%
            </span>
          </div>
        </div>

        {/* Montanha's happy speech quote */}
        <blockquote className="bg-amber-50 text-amber-950 font-bold text-xs sm:text-sm italic px-4 py-2.5 rounded-xl border border-amber-300 mb-5 w-full">
          “Nossa, nunca me senti tão cheiroso e revigorado! Valeu demais, parceiro!”
        </blockquote>

        {/* Restart Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onPlayAgain();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-base shadow-lg shadow-sky-400/40 border-2 border-sky-600 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          Dar Outro Banho no Montanha!
        </button>
      </div>
    </div>
  );
};
