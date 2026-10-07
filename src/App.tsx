import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, GameStage, GameStatus, DirtZone, DodgePose } from './types';
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
  { id: 'head', x: 50, y: 26, radius: 24, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Rosto' },
  { id: 'chest', x: 50, y: 44, radius: 26, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Peito' },
  { id: 'belly', x: 50, y: 64, radius: 30, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Pança' },
  { id: 'armpit_l', x: 28, y: 46, radius: 22, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Suvaco Esquerdo' },
  { id: 'armpit_r', x: 72, y: 46, radius: 22, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Suvaco Direito' },
  { id: 'arm_l', x: 22, y: 60, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Braço Esquerdo' },
  { id: 'arm_r', x: 78, y: 60, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Braço Direito' },
  { id: 'leg_l', x: 40, y: 84, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Perna Esquerda' },
  { id: 'leg_r', x: 60, y: 84, radius: 20, initialDirt: 1, currentDirt: 1, foamed: 0, scrubbed: 0, rinsed: 0, dried: 0, deodorized: 0, label: 'Perna Direita' },
];

const DODGE_POSES: DodgePose[] = [
  'lean_left',
  'lean_right',
  'guard_belly',
  'raise_arms',
  'turn_away',
  'duck',
];

const DODGE_SPEECHES = [
  'Banho não!',
  'Aqui não!',
  'Quase me pegou!',
  'Segura esse trovão!',
  'Foi sem querer!',
  'Tenta de novo!',
  'Na barriga não!',
  'Eu ainda tô limpo!',
  'Esse foi potente!',
  'Corre do pum!',
];

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('PHASE_1_BATH');
  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [stage, setStage] = useState<GameStage>('SOAP');
  const [zones, setZones] = useState<DirtZone[]>(INITIAL_ZONES);
  const [totalTime, setTotalTime] = useState<number>(65);
  const [timeLeft, setTimeLeft] = useState<number>(65);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('Puxa vida, joguei bola no campinho e tô só o pó!');

  // DYNAMIC PHASE 1 DODGING STATE
  const [montanhaPos, setMontanhaPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dodgePose, setDodgePose] = useState<DodgePose>('normal');
  const [showDodgeFart, setShowDodgeFart] = useState<boolean>(false);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [dodgesCount, setDodgesCount] = useState<number>(0);
  const [fartsCount, setFartsCount] = useState<number>(0);

  const speechTimerRef = useRef<number | null>(null);
  const lastDodgeTimeRef = useRef<number>(0);
  const nextMoveTimerRef = useRef<number>(0);

  // Set character speech with auto-dismiss and comical cartoon vocalization
  const setSpeech = useCallback((text: string, duration = 3000) => {
    setSpeechText(text);
    sounds.playMontanhaSpeech(text);
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }
    speechTimerRef.current = window.setTimeout(() => {
      setSpeechText('');
    }, duration);
  }, []);

  // Trigger Montanha Dodge + Loud Flatulence + Screen Shake
  const triggerMontanhaDodge = useCallback(() => {
    if (gameStatus !== 'PLAYING' || currentPhase !== 'PHASE_1_BATH') return;

    const now = Date.now();
    if (now - lastDodgeTimeRef.current < 2200) return; // Prevent spamming
    lastDodgeTimeRef.current = now;

    // Pick random position within bathroom bounds
    const newX = (Math.random() - 0.5) * 190;
    const newY = (Math.random() - 0.5) * 60;
    const nextPose = DODGE_POSES[Math.floor(Math.random() * DODGE_POSES.length)];

    setMontanhaPos({ x: newX, y: newY });
    setDodgePose(nextPose);
    setDodgesCount((d) => d + 1);
    setFartsCount((f) => f + 1);

    // Play swift cartoon dodge whoosh sound and comical flatulence asynchronously
    sounds.playWhooshDodge();
    sounds.playFart();

    // Trigger visual fart cloud & screen shake
    setShowDodgeFart(true);
    setIsScreenShaking(true);

    setTimeout(() => setShowDodgeFart(false), 1400);
    setTimeout(() => setIsScreenShaking(false), 450);
    setTimeout(() => setDodgePose('normal'), 2100);

    // Random funny voice line
    const phrase = DODGE_SPEECHES[Math.floor(Math.random() * DODGE_SPEECHES.length)];
    setSpeech(phrase, 2500);

    // Penalty: small dirt rise
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        currentDirt: Math.min(1, z.currentDirt + 0.025),
      }))
    );
  }, [gameStatus, currentPhase, setSpeech]);

  // Periodic subtle movement of Montanha (stepping around, squirming)
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || currentPhase !== 'PHASE_1_BATH') return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastDodgeTimeRef.current > 2400) {
        // Subtle repositioning
        setMontanhaPos((prev) => ({
          x: Math.max(-95, Math.min(95, prev.x + (Math.random() - 0.5) * 60)),
          y: Math.max(-25, Math.min(25, prev.y + (Math.random() - 0.5) * 30)),
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameStatus, currentPhase]);

  // Calculate overall dirt (0 to 100)
  const overallDirt = Math.max(
    0,
    Math.min(
      100,
      (zones.reduce((acc, z) => acc + z.currentDirt, 0) / zones.length) * 100
    )
  );

  // Calculate current stage progress (0 to 100) across all 5 stages
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
    if (stage === 'TOWEL') {
      const avg = zones.reduce((acc, z) => acc + (z.dried || 0), 0) / zones.length;
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

        let { foamed, scrubbed, rinsed, dried = 0, deodorized, currentDirt } = z;

        if (stage === 'SOAP') {
          foamed = Math.min(1, foamed + amount);
        } else if (stage === 'SCRUB') {
          if (foamed > 0.05) {
            scrubbed = Math.min(1, scrubbed + amount);
            currentDirt = Math.max(0, currentDirt - amount * 0.95);
          } else {
            setSpeech('Passe o sabonete primeiro pra fazer espuma!');
          }
        } else if (stage === 'RINSE') {
          rinsed = Math.min(1, rinsed + amount);
          foamed = Math.max(0, foamed - amount * 1.3);
          currentDirt = Math.max(0, currentDirt - amount * 0.5);
        } else if (stage === 'TOWEL') {
          dried = Math.min(1, dried + amount * 1.25);
        } else if (stage === 'DEODORANT') {
          deodorized = Math.min(1, deodorized + amount * 1.4);
        }

        return {
          ...z,
          foamed,
          scrubbed,
          rinsed,
          dried,
          deodorized,
          currentDirt,
        };
      })
    );
  }, [stage, setSpeech]);

  // Stage completion & automatic advancement across all 5 minigames
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || currentPhase !== 'PHASE_1_BATH') return;

    if (stage === 'SOAP' && stageProgress >= 85) {
      sounds.playStageComplete();
      sounds.playGiggle();
      setStage('SCRUB');
      setSpeech('Maravilha! Agora pegue a bucha e esfregue as manchas!', 3800);
    } else if (stage === 'SCRUB' && stageProgress >= 85) {
      sounds.playStageComplete();
      sounds.playGiggle();
      setStage('RINSE');
      setSpeech('Toda a craca saiu! Abra o chuveirinho para enxaguar!', 3800);
    } else if (stage === 'RINSE' && stageProgress >= 85) {
      sounds.playStageComplete();
      sounds.playGiggle();
      setStage('TOWEL');
      setSpeech('Enxaguado! Agora pegue a toalha e seque o Montanha!', 3800);
    } else if (stage === 'TOWEL' && stageProgress >= 85) {
      sounds.playStageComplete();
      sounds.playGiggle();
      setStage('DEODORANT');
      setSpeech('Quase lá! Agora passe o desodorante 48h no suvaco!', 3800);
    } else if (stage === 'DEODORANT' && stageProgress >= 85) {
      // VICTORY!
      setGameStatus('VICTORY');
      setSpeech('MONTANHA FOI LIMPO! Ficou cheiroso e nos trinques!', 6000);
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
    setDodgesCount(0);
    setFartsCount(0);
    setMontanhaPos({ x: 0, y: 0 });
    setDodgePose('normal');
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
    setDodgesCount(0);
    setFartsCount(0);
    setMontanhaPos({ x: 0, y: 0 });
    setDodgePose('normal');
    setGameStatus('PLAYING');
    setSpeech('Pega o Montanha! Não deixa ele escapar!', 3500);
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

  // RENDER FASE 1: PEGA O MONTANHA
  return (
    <div
      className={`relative w-full min-h-screen bg-sky-100 bathroom-tiles flex flex-col justify-between overflow-hidden transition-transform ${
        isScreenShaking ? 'animate-screen-shake' : ''
      }`}
    >
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
        dodgesCount={dodgesCount}
        fartsCount={fartsCount}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onRestart={handleRestart}
        onSwitchPhase2={() => {
          sounds.playClick();
          handleStartPhase2();
        }}
      />

      {/* CENTER STAGE: MONTANHA & DYNAMIC INTERACTION */}
      <main className="relative flex-1 w-full max-w-lg mx-auto flex items-center justify-center px-4 my-auto">
        <div className="relative w-full flex items-center justify-center">
          {/* Comic Speech Bubble */}
          <SpeechBubble text={speechText} />

          {/* Interactive Scrubbing/Shower Canvas with dynamic Montanha offset */}
          <InteractiveCanvas
            stage={stage}
            zones={zones}
            offsetX={montanhaPos.x}
            offsetY={montanhaPos.y}
            onZoneInteract={handleZoneInteract}
            onScrubbingStateChange={setIsScrubbing}
            isGameOver={gameStatus === 'GAME_OVER'}
            isVictory={gameStatus === 'VICTORY'}
            onCharacterReaction={(reaction) => setSpeech(reaction, 3000)}
            onTryCleanNearMontanha={triggerMontanhaDodge}
          />

          {/* Montanha Character with dynamic movements, dodge poses & loud fart cloud */}
          <MontanhaCharacter
            stage={stage}
            zones={zones}
            overallDirt={overallDirt}
            offsetX={montanhaPos.x}
            offsetY={montanhaPos.y}
            dodgePose={dodgePose}
            showDodgeFart={showDodgeFart}
            isVictory={gameStatus === 'VICTORY'}
            isGameOver={gameStatus === 'GAME_OVER'}
            isScrubbing={isScrubbing}
            bubbleCount={zones.reduce((acc, z) => acc + (z.foamed > 0.2 ? 1 : 0), 0)}
          />
        </div>
      </main>

      {/* BOTTOM TOOL DRAWER (5 Etapas: Sabão, Bucha, Água, Toalha, Desodorante) */}
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
          dodgesCount={dodgesCount}
          fartsCount={fartsCount}
          score={Math.max(100, Math.round(timeLeft * 25 + 200 - dodgesCount * 10))}
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
