import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, GameStage, GameStatus, DirtZone } from './types';
import { sounds } from './audio';
import { GameHUD } from './components/GameHUD';
import { ToolDrawer } from './components/ToolDrawer';
import { MontanhaCharacter } from './components/MontanhaCharacter';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { SpeechBubble } from './components/SpeechBubble';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { StartScreen } from './components/StartScreen';
import { Fase2EscapeGame } from './components/fase2/Fase2EscapeGame';

const INITIAL_ZONES: DirtZone[] = [
  { id: 'head', x: 50, y: 26, radius: 24, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Rosto' },
  { id: 'chest', x: 50, y: 44, radius: 26, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Peito' },
  { id: 'belly', x: 50, y: 64, radius: 30, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Pança' },
  { id: 'armpit_l', x: 28, y: 46, radius: 22, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Suvaco Esquerdo' },
  { id: 'armpit_r', x: 72, y: 46, radius: 22, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Suvaco Direito' },
  { id: 'arm_l', x: 22, y: 60, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Braço Esquerdo' },
  { id: 'arm_r', x: 78, y: 60, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Braço Direito' },
  { id: 'leg_l', x: 40, y: 84, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Perna Esquerda' },
  { id: 'leg_r', x: 60, y: 84, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, deodorized: 0, label: 'Perna Direita' },
];

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('PHASE_1_BATH');
  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [stage, setStage] = useState<GameStage>('SOAP');
  const [zones, setZones] = useState<DirtZone[]>(INITIAL_ZONES);
  const [totalTime, setTotalTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('Puxa vida, joguei bola no campinho e tô só o pó!');

  const speechTimerRef = useRef<number | null>(null);

  // Set character speech with auto-dismiss
  const setSpeech = useCallback((text: string, duration = 3500) => {
    setSpeechText(text);
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }
    speechTimerRef.current = window.setTimeout(() => {
      setSpeechText('');
    }, duration);
  }, []);

  // Calculate overall dirt (0 to 100)
  const overallDirt = Math.max(
    0,
    Math.min(
      100,
      (zones.reduce((acc, z) => acc + z.currentDirt, 0) / zones.length) * 100
    )
  );

  // Calculate current stage progress (0 to 100)
  const getStageProgress = useCallback(() => {
    if (zones.length === 0) return 0;
    if (stage === 'SOAP') {
      const avg = zones.reduce((acc, z) => acc + z.foamed, 0) / zones.length;
      return Math.min(100, Math.round(avg * 100));
    }
    if (stage === 'SCRUB') {
      const avg = zones.reduce((acc, z) => acc + z.scrubbed, 0) / zones.length;
      return Math.min(100, Math.round(avg * 100));
    }
    if (stage === 'RINSE') {
      const avg = zones.reduce((acc, z) => acc + z.rinsed, 0) / zones.length;
      return Math.min(100, Math.round(avg * 100));
    }
    if (stage === 'DEODORANT') {
      const avg = zones.reduce((acc, z) => acc + z.deodorized, 0) / zones.length;
      return Math.min(100, Math.round(avg * 100));
    }
    return 0;
  }, [stage, zones]);

  const stageProgress = getStageProgress();

  // Zone interaction callback
  const handleZoneInteract = useCallback((zoneId: string, amount: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;

        let { foamed, scrubbed, rinsed, deodorized, currentDirt } = z;

        if (stage === 'SOAP') {
          foamed = Math.min(1, foamed + amount);
        } else if (stage === 'SCRUB') {
          if (foamed > 0.1) {
            scrubbed = Math.min(1, scrubbed + amount);
            currentDirt = Math.max(0, currentDirt - amount * 0.9);
          } else {
            // Need soap first hint
            setSpeech('Passe o sabonete primeiro pra fazer espuma!');
          }
        } else if (stage === 'RINSE') {
          rinsed = Math.min(1, rinsed + amount);
          foamed = Math.max(0, foamed - amount * 1.2);
          currentDirt = Math.max(0, currentDirt - amount * 0.5);
        } else if (stage === 'DEODORANT') {
          deodorized = Math.min(1, deodorized + amount * 1.3);
        }

        return {
          ...z,
          foamed,
          scrubbed,
          rinsed,
          deodorized,
          currentDirt,
        };
      })
    );
  }, [stage, setSpeech]);

  // Check stage completion and automatic advancement
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || currentPhase !== 'PHASE_1_BATH') return;

    if (stage === 'SOAP' && stageProgress >= 85) {
      sounds.playStageComplete();
      sounds.playGiggle();
      setStage('SCRUB');
      setSpeech('Maravilha! Agora pegue a bucha e esfregue as manchas!', 4000);
    } else if (stage === 'SCRUB' && stageProgress >= 85) {
      sounds.playStageComplete();
      sounds.playGiggle();
      setStage('RINSE');
      setSpeech('Toda a craca saiu! Abra o chuveirinho para enxaguar!', 4000);
    } else if (stage === 'RINSE' && stageProgress >= 85) {
      sounds.playStageComplete();
      sounds.playGiggle();
      setStage('DEODORANT');
      setSpeech('Quase lá! Agora passe o desodorante 48h no suvaco!', 4000);
    } else if (stage === 'DEODORANT' && stageProgress >= 85) {
      // VICTORY!
      setGameStatus('VICTORY');
      setSpeech('UHUUL! Tô limpinho, cheiroso e pronto pro baile!', 6000);
    }
  }, [stage, stageProgress, gameStatus, currentPhase, setSpeech]);

  // Countdown timer effect for Phase 1
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || currentPhase !== 'PHASE_1_BATH') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStatus('GAME_OVER');
          setSpeech('Ai que inhaca... O tempo acabou!', 4000);
          return 0;
        }

        // Urgency speech
        if (prev === 15) {
          setSpeech('Anda logo que o tempo tá voando!', 3000);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, currentPhase, setSpeech]);

  // Start game handler for Phase 1
  const handleStartPhase1 = (seconds: number) => {
    setCurrentPhase('PHASE_1_BATH');
    setZones(INITIAL_ZONES.map((z) => ({ ...z })));
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setStage('SOAP');
    setGameStatus('PLAYING');
    setSpeech('Passe o sabonete pra fazer bastante espuma!', 3500);
  };

  // Start game handler for Phase 2
  const handleStartPhase2 = () => {
    setCurrentPhase('PHASE_2_ESCAPE');
    setGameStatus('PLAYING');
  };

  // Restart match handler for Phase 1
  const handleRestart = () => {
    sounds.playClick();
    setZones(INITIAL_ZONES.map((z) => ({ ...z })));
    setTimeLeft(totalTime);
    setStage('SOAP');
    setGameStatus('PLAYING');
    setSpeech('Novo banho! Capricha na limpeza!', 3500);
  };

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // RENDER FASE 2: FUGA DO BANHO
  if (currentPhase === 'PHASE_2_ESCAPE' && gameStatus === 'PLAYING') {
    return (
      <Fase2EscapeGame
        onBackToMenu={() => setGameStatus('TITLE')}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    );
  }

  // RENDER FASE 1: HORA DO BANHO
  return (
    <div className="relative w-full min-h-screen bg-sky-100 bathroom-tiles flex flex-col justify-between overflow-hidden">
      {/* Background Bathroom Decor Elements */}
      <div className="absolute top-2 left-3 text-2xl select-none opacity-40 pointer-events-none hidden sm:block">
        🫧
      </div>
      <div className="absolute top-24 left-8 text-3xl select-none opacity-30 pointer-events-none hidden sm:block">
        🫧
      </div>
      <div className="absolute top-16 right-6 text-2xl select-none opacity-40 pointer-events-none hidden sm:block">
        🫧
      </div>

      {/* Cute Rubber Duck Floating on Side */}
      <div className="absolute bottom-20 left-4 select-none pointer-events-none hidden sm:flex items-center gap-1 opacity-75">
        <span className="text-3xl animate-bounce">🦆</span>
      </div>

      {/* TOP HUD */}
      <GameHUD
        overallDirt={overallDirt}
        timeLeft={timeLeft}
        stage={stage}
        stageProgress={stageProgress}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onRestart={handleRestart}
        onSwitchPhase2={() => {
          sounds.playClick();
          handleStartPhase2();
        }}
      />

      {/* CENTER STAGE: MONTANHA & INTERACTION */}
      <main className="relative flex-1 w-full max-w-lg mx-auto flex items-center justify-center px-4 my-auto">
        <div className="relative w-full flex items-center justify-center">
          {/* Comic Speech Bubble */}
          <SpeechBubble text={speechText} />

          {/* Interactive Scrubbing/Shower Canvas */}
          <InteractiveCanvas
            stage={stage}
            zones={zones}
            onZoneInteract={handleZoneInteract}
            onScrubbingStateChange={setIsScrubbing}
            isGameOver={gameStatus === 'GAME_OVER'}
            isVictory={gameStatus === 'VICTORY'}
            onCharacterReaction={(reaction) => setSpeech(reaction, 3200)}
          />

          {/* Montanha Character */}
          <MontanhaCharacter
            stage={stage}
            zones={zones}
            overallDirt={overallDirt}
            isVictory={gameStatus === 'VICTORY'}
            isGameOver={gameStatus === 'GAME_OVER'}
            isScrubbing={isScrubbing}
            bubbleCount={zones.reduce((acc, z) => acc + (z.foamed > 0.2 ? 1 : 0), 0)}
          />
        </div>
      </main>

      {/* BOTTOM TOOL DRAWER */}
      <ToolDrawer
        currentStage={stage}
        onSelectStage={(s) => setStage(s)}
        stageProgress={stageProgress}
      />

      {/* MODALS */}
      {gameStatus === 'TITLE' && (
        <StartScreen
          onStartPhase1={handleStartPhase1}
          onStartPhase2={handleStartPhase2}
        />
      )}

      {gameStatus === 'VICTORY' && (
        <VictoryModal
          timeLeft={timeLeft}
          totalTime={totalTime}
          onPlayAgain={handleRestart}
          onNextPhase={() => {
            sounds.playClick();
            handleStartPhase2();
          }}
        />
      )}

      {gameStatus === 'GAME_OVER' && (
        <GameOverModal
          overallDirt={overallDirt}
          onRetry={handleRestart}
        />
      )}
    </div>
  );
}
