import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../audio';
import { RotateCcw, Home, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  distanceMeters: number;
  score: number;
  coins: number;
  onRetry: () => void;
  onBackToMenu: () => void;
}

export const Fase2GameOverModal: React.FC<GameOverModalProps> = ({
  distanceMeters,
  score,
  coins,
  onRetry,
  onBackToMenu,
}) => {
  useEffect(() => {
    sounds.playGameOver();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-4 border-rose-500 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Comic Mascot: Montanha wrapped in a towel like a mummy */}
        <div className="w-20 h-20 rounded-3xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-4xl mb-3 -mt-2 shadow-md animate-bounce">
          🧼
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight leading-tight">
          TE PEGARAM, MONTANHA!
        </h2>

        <p className="text-sm font-semibold text-rose-700 mt-1">
          O perseguidor te alcançou com a bucha e o sabonete! De volta para o chuveiro...
        </p>

        {/* Stats */}
        <div className="w-full bg-rose-50 rounded-2xl border-2 border-rose-200 p-3 my-4 grid grid-cols-3 gap-1 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Distância</span>
            <span className="text-sm font-black text-rose-900">{Math.round(distanceMeters)}m</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Patos</span>
            <span className="text-sm font-black text-amber-700">🦆 {coins}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Pontos</span>
            <span className="text-sm font-black text-sky-900">{score}</span>
          </div>
        </div>

        {/* Funny quote */}
        <blockquote className="bg-slate-100 text-slate-700 font-bold text-xs italic px-3 py-2 rounded-xl border border-slate-200 mb-5 w-full">
          “Caramba, o sabonete escorregou e eles me pegaram! Quase consegui chegar no quintal!”
        </blockquote>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onRetry();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-sm shadow-md border-2 border-rose-600 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            TENTAR NOVAMENTE
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onBackToMenu();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            VOLTAR AO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  score: number;
  coins: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const Fase2VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coins,
  onPlayAgain,
  onBackToMenu,
}) => {
  useEffect(() => {
    sounds.playVictory();
    sounds.playSurpriseHose();

    // Confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/70 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-4 border-amber-400 p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Victory Celebration Badge */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-amber-500 flex items-center justify-center text-4xl mb-3 -mt-2 shadow-lg animate-bounce">
          🏡
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">
          “HAHA! ESCAPEI DO BANHO!”
        </h2>

        {/* Surprise Twist with garden hose */}
        <div className="w-full bg-amber-50 rounded-2xl border-2 border-amber-300 p-3.5 my-3 flex items-center gap-3 text-left">
          <span className="text-3xl animate-bounce">🚨</span>
          <div>
            <p className="text-xs font-black text-amber-900 leading-tight">
              ESPÉRA AÍ! Uma mangueira de jardim ligou no quintal!
            </p>
            <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
              Montanha olha assustado para a câmera... O banho não perdoa!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full bg-sky-50 rounded-2xl border border-sky-200 p-3 mb-4 flex justify-around text-xs font-bold text-sky-900">
          <div>
            <span className="text-slate-500 block">Distância</span>
            <span className="text-base font-black">500m (Fim da Casa!)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Patos Dourados</span>
            <span className="text-base font-black text-amber-600">🦆 {coins}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Pontuação</span>
            <span className="text-base font-black text-emerald-600">⭐ {score}</span>
          </div>
        </div>

        {/* Continua na Fase 3 Banner */}
        <div className="bg-sky-900 text-white font-black text-sm px-4 py-2 rounded-xl mb-4 tracking-wide shadow-inner flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Continua na Fase 3...</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              alert('Fase 3: O Banho de Mangueira no Quintal está em desenvolvimento!');
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-md border-2 border-emerald-600 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
          >
            PRÓXIMA FASE (Prévia)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onPlayAgain();
              }}
              className="py-2.5 px-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-black text-xs border border-sky-300 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              REJOGAR FASE 2
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onBackToMenu();
              }}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              MENU PRINCIPAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
