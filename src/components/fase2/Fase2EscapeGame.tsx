import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RunnerState, RunnerObstacle, RunnerCollectible } from '../../types';
import { sounds } from '../../audio';
import { MontanhaRunner } from './MontanhaRunner';
import { PursuerCharacter } from './PursuerCharacter';
import { ObstaclesLayer } from './ObstaclesLayer';
import { Fase2ParallaxBackground } from './Fase2ParallaxBackground';
import { Fase2HUD } from './Fase2HUD';
import { Fase2GameOverModal, Fase2VictoryModal } from './Fase2Modals';

interface Fase2EscapeGameProps {
  onBackToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const OBSTACLE_KINDS_GROUND: RunnerObstacle['kind'][] = [
  'bucket',
  'soap_slip',
  'puddle',
  'duck',
  'box',
  'laundry_basket',
];

const OBSTACLE_KINDS_OVERHEAD: RunnerObstacle['kind'][] = [
  'towel_hanging',
  'flying_sponge',
  'shower_hose',
];

const FUNNY_SPEECHES = [
  'Banho hoje não!',
  'Corre Montanha!',
  'Sabonete não!',
  'Eu tô cheiroso ainda!',
  'Foi o vento!',
  'Essa escapou!',
  'Não olha pra trás!',
  'Ativa o gás turbo!',
  'Opa, escorreguei!',
  'Sai pra lá com essa bucha!',
];

export const Fase2EscapeGame: React.FC<Fase2EscapeGameProps> = ({
  onBackToMenu,
  isMuted,
  onToggleMute,
}) => {
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [pursuerDistance, setPursuerDistance] = useState<number>(55); // meters (0 to 100)
  const [turboMeter, setTurboMeter] = useState<number>(30); // 0 to 100%
  const [runnerState, setRunnerState] = useState<RunnerState>('running');
  const [showFartPuff, setShowFartPuff] = useState<boolean>(false);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('Banho hoje não! Fui!');
  const [gameState, setGameState] = useState<'PLAYING' | 'VICTORY' | 'GAME_OVER'>('PLAYING');

  // Animation & Physics Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Runner vertical position & jump physics
  const runnerYRef = useRef<number>(0); // 0 = on ground, > 0 = airborne
  const runnerVyRef = useRef<number>(0);
  const isDuckingRef = useRef<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);
  const isInvulnerableRef = useRef<boolean>(false);
  const isTurboActiveRef = useRef<boolean>(false);
  const turboEndTimeRef = useRef<number>(0);

  const runCycleRef = useRef<number>(0);
  const scrollOffsetRef = useRef<number>(0);

  // Obstacles and collectibles
  const obstaclesRef = useRef<RunnerObstacle[]>([]);
  const collectiblesRef = useRef<RunnerCollectible[]>([]);
  const lastSpawnXRef = useRef<number>(600);
  const nextObstacleIdRef = useRef<number>(1);

  // Flatulence timer ref
  const nextFartTimeRef = useRef<number>(Date.now() + 4000);
  const speechTimerRef = useRef<number | null>(null);

  // Trigger Montanha comic speech
  const showSpeech = useCallback((text: string, duration = 2500) => {
    setSpeechText(text);
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }
    speechTimerRef.current = window.setTimeout(() => {
      setSpeechText('');
    }, duration);
  }, []);

  // Jump Action
  const handleJump = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (isJumpingRef.current || isDuckingRef.current) return;

    sounds.playJump();
    isJumpingRef.current = true;
    runnerVyRef.current = 14.5; // Jump velocity
    setRunnerState('jumping');
  }, [gameState]);

  // Duck Action
  const handleDuckStart = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (isJumpingRef.current) return;

    if (!isDuckingRef.current) {
      sounds.playDuckSlide();
    }
    isDuckingRef.current = true;
    setRunnerState('ducking');
  }, [gameState]);

  const handleDuckEnd = useCallback(() => {
    isDuckingRef.current = false;
    if (!isJumpingRef.current && runnerState === 'ducking') {
      setRunnerState(isTurboActiveRef.current ? 'turbo' : 'running');
    }
  }, [runnerState]);

  // Trigger Turbo Boost
  const handleTriggerTurbo = useCallback(() => {
    if (gameState !== 'PLAYING' || turboMeter < 100) return;

    sounds.playTurboBoost();
    isTurboActiveRef.current = true;
    turboEndTimeRef.current = Date.now() + 3500;
    setTurboMeter(0);
    setRunnerState('turbo');

    // Give Montanha major distance boost from pursuer!
    setPursuerDistance((prev) => Math.min(100, prev + 35));
    showSpeech('SEGURA O GÁS TURBO! 💨🚀', 3000);
  }, [gameState, turboMeter, showSpeech]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuckStart();
      } else if (e.code === 'KeyT' || e.code === 'KeyX' || e.code === 'ShiftLeft') {
        e.preventDefault();
        handleTriggerTurbo();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        handleDuckEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleJump, handleDuckStart, handleDuckEnd, handleTriggerTurbo]);

  // Restart Phase 2
  const handleRestart = () => {
    sounds.playClick();
    setDistanceMeters(0);
    setScore(0);
    setCoins(0);
    setPursuerDistance(55);
    setTurboMeter(35);
    setRunnerState('running');
    setShowFartPuff(false);
    setIsInvulnerable(false);
    isInvulnerableRef.current = false;
    isJumpingRef.current = false;
    isDuckingRef.current = false;
    isTurboActiveRef.current = false;
    runnerYRef.current = 0;
    runnerVyRef.current = 0;
    scrollOffsetRef.current = 0;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    lastSpawnXRef.current = 500;
    setGameState('PLAYING');
    showSpeech('Banho hoje não! Fui!', 2500);
  };

  // Main 60fps Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Check Turbo duration
      if (isTurboActiveRef.current && Date.now() > turboEndTimeRef.current) {
        isTurboActiveRef.current = false;
        if (!isJumpingRef.current && !isDuckingRef.current) {
          setRunnerState('running');
        }
      }

      // Base speed calculation (pixels per second)
      const currentSpeed = isTurboActiveRef.current
        ? 520
        : 260 + (scrollOffsetRef.current / 1500) * 15;

      const deltaX = currentSpeed * dt;
      scrollOffsetRef.current += deltaX;

      // Update distance meters (1 meter = 8 pixels)
      const newMeters = scrollOffsetRef.current / 8;
      setDistanceMeters(newMeters);

      // Check Victory Condition at 500m!
      if (newMeters >= 500) {
        setGameState('VICTORY');
        return;
      }

      // Run cycle animation
      runCycleRef.current = (runCycleRef.current + dt * (currentSpeed / 40)) % 1;

      // JUMP PHYSICS
      if (isJumpingRef.current) {
        runnerYRef.current += runnerVyRef.current;
        runnerVyRef.current -= 34 * dt; // Gravity

        if (runnerYRef.current <= 0) {
          runnerYRef.current = 0;
          runnerVyRef.current = 0;
          isJumpingRef.current = false;
          if (isDuckingRef.current) {
            setRunnerState('ducking');
          } else {
            setRunnerState(isTurboActiveRef.current ? 'turbo' : 'running');
          }
        }
      }

      // CHARGE TURBO GAUGE
      setTurboMeter((prev) => Math.min(100, prev + dt * 4.5));

      // PURSUER DISTANCE DYNAMICS
      setPursuerDistance((prev) => {
        let change = isTurboActiveRef.current ? dt * 10 : -dt * 1.2;
        // As game progresses, pursuer is slightly more aggressive
        if (newMeters > 250) change -= dt * 0.8;
        const updated = Math.max(0, Math.min(100, prev + change));

        // Check captured game over
        if (updated <= 0) {
          setGameState('GAME_OVER');
        }
        return updated;
      });

      // RANDOM COMIC FLATULENCE TRIGGER
      if (Date.now() > nextFartTimeRef.current && !isTurboActiveRef.current) {
        sounds.playFart();
        setShowFartPuff(true);
        setTimeout(() => setShowFartPuff(false), 1400);

        // Pick a funny quote
        const randomQuote = FUNNY_SPEECHES[Math.floor(Math.random() * FUNNY_SPEECHES.length)];
        showSpeech(randomQuote, 2200);

        // Next fart in 6 to 11 seconds
        nextFartTimeRef.current = Date.now() + 6000 + Math.random() * 5000;
      }

      // SPAWN OBSTACLES & COLLECTIBLES
      const screenWidth = containerRef.current ? containerRef.current.clientWidth : 800;
      if (lastSpawnXRef.current - deltaX < screenWidth + 200) {
        // Spawn distance
        const spawnDistance = 240 + Math.random() * 180;
        const spawnX = screenWidth + spawnDistance;

        // 70% Ground, 30% Overhead
        const isOverhead = Math.random() < 0.32;
        const kind = isOverhead
          ? OBSTACLE_KINDS_OVERHEAD[Math.floor(Math.random() * OBSTACLE_KINDS_OVERHEAD.length)]
          : OBSTACLE_KINDS_GROUND[Math.floor(Math.random() * OBSTACLE_KINDS_GROUND.length)];

        // Dimensions
        let width = 45;
        let height = 45;
        let y = 0; // Relative to bottom

        if (isOverhead) {
          width = 50;
          height = 55;
          y = 110; // Overhead obstacle hanging in air
        } else {
          width = kind === 'puddle' ? 55 : 44;
          height = kind === 'puddle' ? 24 : 44;
          y = 64; // On the floor
        }

        obstaclesRef.current.push({
          id: nextObstacleIdRef.current++,
          kind,
          x: spawnX,
          y: isOverhead ? 60 : 210, // top position in px
          width,
          height,
          isOverhead,
        });

        // Spawn a collectible near obstacle or in air
        if (Math.random() < 0.65) {
          const colKind = Math.random() < 0.5 ? 'rubber_duck' : Math.random() < 0.8 ? 'gold_soap' : 'deodorant_can';
          collectiblesRef.current.push({
            id: nextObstacleIdRef.current++,
            kind: colKind,
            x: spawnX + 90,
            y: isOverhead ? 220 : 130, // jump to collect or run through
            width: 32,
            height: 32,
          });
        }

        lastSpawnXRef.current = spawnX;
      }

      // MOVE OBSTACLES & DETECT COLLISIONS
      // Montanha fixed screen X position
      const montanhaX = 135;
      const montanhaY = runnerYRef.current; // 0 = ground, > 0 = jump
      const montanhaWidth = 65;
      const montanhaHeight = isDuckingRef.current ? 42 : 85;

      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= deltaX;

        // Collision check
        if (!isInvulnerableRef.current && !obs.passed) {
          const xOverlap = montanhaX + montanhaWidth > obs.x + 8 && montanhaX + 12 < obs.x + obs.width - 8;

          if (xOverlap) {
            let hit = false;
            if (obs.isOverhead) {
              // Overhead obstacle: hits if Montanha is NOT ducking
              if (!isDuckingRef.current) {
                hit = true;
              }
            } else {
              // Ground obstacle: hits if Montanha is on ground or hasn't cleared height
              if (montanhaY < obs.height - 10) {
                hit = true;
              }
            }

            if (hit) {
              obs.passed = true;
              sounds.playTrip();
              setRunnerState('tripping');
              setIsInvulnerable(true);
              isInvulnerableRef.current = true;

              // Penalty: Pursuer gains 20 meters!
              setPursuerDistance((p) => Math.max(0, p - 20));
              showSpeech('Opa! Tropecei!', 2000);

              setTimeout(() => {
                setIsInvulnerable(false);
                isInvulnerableRef.current = false;
                if (gameState === 'PLAYING') {
                  setRunnerState(isTurboActiveRef.current ? 'turbo' : 'running');
                }
              }, 1000);
            }
          }
        }

        // Passed scoring
        if (!obs.passed && obs.x + obs.width < montanhaX) {
          obs.passed = true;
          setScore((s) => s + 15);
        }

        // Remove offscreen
        if (obs.x < -100) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // MOVE COLLECTIBLES & DETECT PICKUP
      for (let i = collectiblesRef.current.length - 1; i >= 0; i--) {
        const col = collectiblesRef.current[i];
        col.x -= deltaX;

        if (!col.collected) {
          const xOverlap = montanhaX + montanhaWidth > col.x && montanhaX < col.x + col.width;
          const yOverlap = (col.y > 180 && montanhaY < 40) || (col.y <= 180 && montanhaY > 20);

          if (xOverlap && yOverlap) {
            col.collected = true;
            sounds.playCollectItem();

            if (col.kind === 'rubber_duck') {
              setCoins((c) => c + 1);
              setScore((s) => s + 50);
            } else if (col.kind === 'gold_soap') {
              setScore((s) => s + 30);
            } else if (col.kind === 'deodorant_can') {
              // Turbo charge!
              setTurboMeter((t) => Math.min(100, t + 25));
              setScore((s) => s + 40);
            }
          }
        }

        if (col.x < -100) {
          collectiblesRef.current.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, showSpeech]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen max-h-screen overflow-hidden select-none bg-sky-200"
      style={{ touchAction: 'none' }}
    >
      {/* Parallax Background with 5 Domestic Zones */}
      <Fase2ParallaxBackground
        distanceMeters={distanceMeters}
        scrollOffset={scrollOffsetRef.current}
      />

      {/* Obstacles and Collectibles Layer */}
      <ObstaclesLayer
        obstacles={obstaclesRef.current}
        collectibles={collectiblesRef.current}
      />

      {/* CHARACTERS LAYER */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Floor Line Height: Bottom 64px */}
        <div className="absolute bottom-16 inset-x-0 h-0">
          {/* Pursuer Character Positioned by Distance */}
          <div
            className="absolute transition-none"
            style={{
              left: `${Math.max(-80, 135 - (pursuerDistance * 2.4) - 40)}px`,
              bottom: '0px',
            }}
          >
            <PursuerCharacter
              distance={pursuerDistance}
              runCycle={runCycleRef.current}
            />
          </div>

          {/* Montanha Character */}
          <div
            className="absolute transition-none"
            style={{
              left: '135px',
              bottom: `${runnerYRef.current}px`,
            }}
          >
            {/* Comic Speech Bubble */}
            {speechText && (
              <div className="absolute -top-12 left-6 bg-white text-slate-800 text-xs font-black px-2.5 py-1.5 rounded-2xl border-2 border-sky-400 shadow-md whitespace-nowrap animate-bounce">
                <span>{speechText}</span>
                <div className="absolute -bottom-1.5 left-4 w-2 h-2 bg-white border-b-2 border-r-2 border-sky-400 rotate-45" />
              </div>
            )}

            <MontanhaRunner
              state={runnerState}
              showFartPuff={showFartPuff}
              isInvulnerable={isInvulnerable}
              runCycle={runCycleRef.current}
            />
          </div>
        </div>
      </div>

      {/* TOP & CONTROLS HUD */}
      <Fase2HUD
        distanceMeters={distanceMeters}
        score={score}
        coins={coins}
        pursuerDistance={pursuerDistance}
        turboMeter={turboMeter}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onRestart={handleRestart}
        onJump={handleJump}
        onDuckStart={handleDuckStart}
        onDuckEnd={handleDuckEnd}
        onTriggerTurbo={handleTriggerTurbo}
        onBackToMenu={onBackToMenu}
      />

      {/* MODALS */}
      {gameState === 'GAME_OVER' && (
        <Fase2GameOverModal
          distanceMeters={distanceMeters}
          score={score}
          coins={coins}
          onRetry={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}

      {gameState === 'VICTORY' && (
        <Fase2VictoryModal
          score={score}
          coins={coins}
          onPlayAgain={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  );
};
