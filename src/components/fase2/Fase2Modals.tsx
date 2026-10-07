import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../audio';
import { RotateCcw, Home, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  distanceMeters: number;
  score: number;
  coins: number;
  dodgesCount?: number;
  cleanLevel?: number;
  timeSurvivedSeconds?: number;
  onRetry: () => void;
  onBackToMenu: () => void;
}

export const Fase2GameOverModal: React.FC<GameOverModalProps> = ({
  distanceMeters,
  score,
  coins,
  dodgesCount = 0,
  cleanLevel = 100,
  timeSurvivedSeconds = 0,
  onRetry,
  onBackToMenu,
}) => {
  useEffect(() => {
    sounds.playGameOver();
  }, []);

  const getTitle = () => {
    if (distanceMeters > 350) return '👑 Cascão Lendário';
    if (distanceMeters > 200) return '🏃 Mestre do Desvio Molhado';
    if (distanceMeters > 100) return '💨 Fugitivo Cheiroso';
    return '🧼 Vítima da Mangueira';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-4 border-sky-400 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Comic Mascot: Montanha 100% clean with sparkles */}
        <div className="w-20 h-20 rounded-3xl bg-sky-100 border-2 border-sky-400 flex items-center justify-center text-4xl mb-3 -mt-2 shadow-md animate-bounce">
          🧼✨
        </div>

        <div className="inline-block bg-sky-100 text-sky-800 text-[11px] font-black px-3 py-0.5 rounded-full mb-1 border border-sky-300">
          {cleanLevel >= 100 ? '100% LIMPO! O BANHO VENCEU!' : 'TE PEGARAM NO BANHO!'}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight leading-tight">
          MONTANHA FOI LIMPO!
        </h2>

        <p className="text-xs font-bold text-sky-700 mt-1">
          A água e os sabonetes te alcançaram! Montanha está cheiroso e sem sua craca protetora!
        </p>

        {/* Player Badge */}
        <div className="mt-2 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl text-amber-900 font-black text-xs">
          Título: <span className="text-amber-950">{getTitle()}</span>
        </div>

        {/* Stats */}
        <div className="w-full bg-sky-50 rounded-2xl border-2 border-sky-200 p-3 my-3 grid grid-cols-3 gap-1 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Distância</span>
            <span className="text-sm font-black text-sky-900">{Math.round(distanceMeters)}m</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Desvios</span>
            <span className="text-sm font-black text-emerald-700">💨 {dodgesCount}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Pontos</span>
            <span className="text-sm font-black text-amber-700">{score}</span>
          </div>
        </div>

        {/* Funny quote */}
        <blockquote className="bg-slate-100 text-slate-700 font-bold text-xs italic px-3 py-2 rounded-xl border border-slate-200 mb-4 w-full">
          “Ai ai ai, tiraram toda a minha sujeira de estimação... Mas pelo menos tô cheiroso e refrescado!”
        </blockquote>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onRetry();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-sm shadow-md border-2 border-sky-600 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            TENTAR RESISTIR NOVAMENTE
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
        <div className="bg-sky-900 text-white font-black text-sm px-4 py-2 rounded-xl mb-4 tracking-wide shadow-inner flex items-center justify-center gap-2 w-full">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Fase 3: O Banho no Quintal (Em Breve!)</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onPlayAgain();
              }}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md border-2 border-emerald-600 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              REJOGAR FASE 2
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onBackToMenu();
              }}
              className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
            >
              <Home className="w-4 h-4" />
              MENU PRINCIPAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
