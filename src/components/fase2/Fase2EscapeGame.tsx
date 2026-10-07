import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RunnerState, RunnerObstacle, RunnerCollectible, WaterAttack, WaterAttackType } from '../../types';
import { sounds } from '../../audio';
import { MontanhaRunner } from './MontanhaRunner';
import { PursuerCharacter } from './PursuerCharacter';
import { Fase2ParallaxBackground } from './Fase2ParallaxBackground';
import { Fase2HUD } from './Fase2HUD';
import { Fase2GameOverModal, Fase2VictoryModal } from './Fase2Modals';
import { drawActionCanvas, FloatingTextItem } from './Fase2ActionCanvas';

interface Fase2EscapeGameProps {
  onBackToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const OBSTACLE_KINDS_GROUND: RunnerObstacle['kind'][] = [
  'bucket',
  'soap_slip',
  'puddle',
  'mud_puddle',
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
  'Minha sujeira é sagrada!',
  'Água gelada não!',
];

const WATER_HIT_SPEECHES = [
  'Ai, água fria! 🥶',
  'Minha casca protetora! 😱',
  'Tá gelada essa água!',
  'Sai com essa mangueira!',
  'Não me ensaboa não!',
  'Socorro, tô limpando!',
];

const MUD_SPEECHES = [
  'Oba, lama fresquinha! 💩',
  'Isso sim é perfume de macho!',
  'Barro protetor ativado!',
  'Voltei a ficar sujinho! Que alívio!',
];

const DODGE_SPEECHES = [
  'Passou longe! 💨',
  'Errou feio, errou rude!',
  'Tô liso que nem sabão!',
  'Nem relou em mim!',
];

export const Fase2EscapeGame: React.FC<Fase2EscapeGameProps> = ({
  onBackToMenu,
  isMuted,
  onToggleMute,
}) => {
  // Throttled HUD States (updated ~15fps so React doesn't freeze the main thread)
  const [cleanLevel, setCleanLevel] = useState<number>(0);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [pursuerDistance, setPursuerDistance] = useState<number>(45);
  const [turboMeter, setTurboMeter] = useState<number>(35);
  const [gameState, setGameState] = useState<'PLAYING' | 'VICTORY' | 'GAME_OVER'>('PLAYING');
  const [dodgesCount, setDodgesCount] = useState<number>(0);

  // Character Visual States
  const [runnerState, setRunnerState] = useState<RunnerState>('running');
  const [showFartPuff, setShowFartPuff] = useState<boolean>(false);
  const [isWaterHit, setIsWaterHit] = useState<boolean>(false);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('Banho hoje não! Fui!');

  // Pursuer Visual States
  const [currentWeapon, setCurrentWeapon] = useState<WaterAttackType>('hose_low');
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [isFartNearby, setIsFartNearby] = useState<boolean>(false);

  // High Performance Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const montanhaWrapperRef = useRef<HTMLDivElement | null>(null);
  const pursuerWrapperRef = useRef<HTMLDivElement | null>(null);

  // Physics and Game State in Refs (No React render cost per frame!)
  const distanceRef = useRef<number>(0);
  const turboMeterRef = useRef<number>(35);
  const pursuerDistRef = useRef<number>(45);
  const cleanLevelRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const coinsRef = useRef<number>(0);
  const dodgesCountRef = useRef<number>(0);

  const runnerYRef = useRef<number>(0);
  const runnerVyRef = useRef<number>(0);
  const montanhaXOffsetRef = useRef<number>(0);
  const isDuckingRef = useRef<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);
  const isInvulnerableRef = useRef<boolean>(false);
  const isTurboActiveRef = useRef<boolean>(false);
  const turboEndTimeRef = useRef<number>(0);
  const jumpBufferedRef = useRef<boolean>(false);

  const obstaclesRef = useRef<RunnerObstacle[]>([]);
  const collectiblesRef = useRef<RunnerCollectible[]>([]);
  const attacksRef = useRef<WaterAttack[]>([]);
  const floatingTextsRef = useRef<FloatingTextItem[]>([]);

  const lastSpawnXRef = useRef<number>(500);
  const nextItemIdRef = useRef<number>(1);
  const nextFartTimeRef = useRef<number>(Date.now() + 6000);
  const nextAttackTimeRef = useRef<number>(Date.now() + 3000);
  const lastHudUpdateRef = useRef<number>(0);

  const speechTimerRef = useRef<number | null>(null);
  const waterHitTimerRef = useRef<number | null>(null);
  const fartNearbyTimerRef = useRef<number | null>(null);

  // Floating text helper (drawn on canvas)
  const addFloatingText = useCallback(
    (text: string, x: number, y: number, color = '#38bdf8') => {
      floatingTextsRef.current.push({
        id: nextItemIdRef.current++,
        text,
        x,
        y,
        color,
        alpha: 1.0,
      });
      // Cap at 8 active floating texts
      if (floatingTextsRef.current.length > 8) {
        floatingTextsRef.current.shift();
      }
    },
    []
  );

  // Trigger Montanha speech bubble
  const showSpeech = useCallback((text: string, duration = 2200) => {
    setSpeechText(text);
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }
    speechTimerRef.current = window.setTimeout(() => {
      setSpeechText('');
    }, duration);
  }, []);

  // Jump Action with dynamic buffering & snappy impulse
  const handleJump = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    if (isJumpingRef.current) {
      if (runnerYRef.current < 45 && runnerVyRef.current < 2) {
        jumpBufferedRef.current = true;
      }
      return;
    }

    if (isDuckingRef.current) {
      isDuckingRef.current = false;
    }

    sounds.playJump();
    isJumpingRef.current = true;
    jumpBufferedRef.current = false;
    runnerVyRef.current = 14.8;
    setRunnerState('jumping');
  }, [gameState]);

  // Duck Action with fast-fall in mid-air
  const handleDuckStart = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    if (isJumpingRef.current) {
      if (runnerVyRef.current > -5) {
        runnerVyRef.current = -12;
      }
    } else {
      isDuckingRef.current = true;
      sounds.playDuckSlide();
      setRunnerState('ducking');
    }
  }, [gameState]);

  const handleDuckEnd = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    isDuckingRef.current = false;
    if (!isJumpingRef.current) {
      setRunnerState(isTurboActiveRef.current ? 'turbo' : 'running');
    }
  }, [gameState]);

  // Turbo Action
  const handleTriggerTurbo = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (turboMeterRef.current < 100 || isTurboActiveRef.current) return;

    turboMeterRef.current = 0;
    setTurboMeter(0);
    isTurboActiveRef.current = true;
    turboEndTimeRef.current = Date.now() + 3800; // 3.8s duration

    sounds.playTurboBoost();
    if (!isJumpingRef.current && !isDuckingRef.current) {
      setRunnerState('turbo');
    }
    addFloatingText('🚀 SUPER TURBO ATIVADO!', 160, 110, '#84cc16');
    showSpeech('SAI DA FRENTE QUE EU TÔ VELOZ! 💨', 2200);
  }, [gameState, addFloatingText, showSpeech]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuckStart();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyT') {
        e.preventDefault();
        handleTriggerTurbo();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        montanhaXOffsetRef.current = -30;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        montanhaXOffsetRef.current = 30;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        handleDuckEnd();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
        montanhaXOffsetRef.current = 0;
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
    cleanLevelRef.current = 0;
    distanceRef.current = 0;
    scoreRef.current = 0;
    coinsRef.current = 0;
    pursuerDistRef.current = 45;
    turboMeterRef.current = 35;
    dodgesCountRef.current = 0;

    setCleanLevel(0);
    setDistanceMeters(0);
    setScore(0);
    setCoins(0);
    setPursuerDistance(45);
    setTurboMeter(35);
    setDodgesCount(0);

    setRunnerState('running');
    setShowFartPuff(false);
    setIsWaterHit(false);
    setIsInvulnerable(false);
    setIsAiming(false);
    setIsFartNearby(false);

    isInvulnerableRef.current = false;
    isJumpingRef.current = false;
    isDuckingRef.current = false;
    isTurboActiveRef.current = false;
    runnerYRef.current = 0;
    runnerVyRef.current = 0;
    montanhaXOffsetRef.current = 0;

    obstaclesRef.current = [];
    collectiblesRef.current = [];
    attacksRef.current = [];
    floatingTextsRef.current = [];

    lastSpawnXRef.current = 500;
    nextAttackTimeRef.current = Date.now() + 3000;
    nextFartTimeRef.current = Date.now() + 6000;
    setGameState('PLAYING');
    showSpeech('Banho hoje não! Fui!', 2500);
  };

  // Main 60/120fps High-Performance Game Loop
  // DEPENDS ONLY ON gameState! Never restarts mid-game!
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.08);
      lastTime = time;

      // 1. TURBO DURATION
      if (isTurboActiveRef.current && Date.now() > turboEndTimeRef.current) {
        isTurboActiveRef.current = false;
        if (!isJumpingRef.current && !isDuckingRef.current) {
          setRunnerState('running');
        }
      }

      // 2. SPEED & DISTANCE
      const currentSpeed = isTurboActiveRef.current
        ? 520
        : 260 + (distanceRef.current / 15);
      const deltaX = currentSpeed * dt;
      distanceRef.current += deltaX / 8; // 1 meter = 8 pixels

      // Check Victory Condition: Survived 500 meters without reaching 100% clean!
      if (distanceRef.current >= 500) {
        setDistanceMeters(500);
        setGameState('VICTORY');
        return;
      }

      // 3. JUMP PHYSICS (Delta-time normalized, smooth on 60/120/144Hz)
      if (isJumpingRef.current) {
        const timeScale = Math.min(2.5, dt * 60);
        runnerYRef.current += runnerVyRef.current * timeScale;
        runnerVyRef.current -= 0.62 * timeScale; // Gravity

        if (runnerYRef.current <= 0) {
          runnerYRef.current = 0;
          runnerVyRef.current = 0;
          isJumpingRef.current = false;

          if (jumpBufferedRef.current) {
            jumpBufferedRef.current = false;
            sounds.playJump();
            isJumpingRef.current = true;
            runnerVyRef.current = 14.8;
            setRunnerState('jumping');
          } else if (isDuckingRef.current) {
            setRunnerState('ducking');
          } else {
            setRunnerState(isTurboActiveRef.current ? 'turbo' : 'running');
          }
        }
      }

      // 4. CHARGE TURBO
      turboMeterRef.current = Math.min(100, turboMeterRef.current + dt * 3.5);

      // 5. PURSUER DISTANCE DYNAMICS
      let distChange = isTurboActiveRef.current ? dt * 10 : -dt * 0.9;
      if (distanceRef.current > 200) distChange -= dt * 0.6;
      pursuerDistRef.current = Math.max(12, Math.min(95, pursuerDistRef.current + distChange));

      // 6. DIRECT GPU TRANSFORM UPDATES FOR CHARACTERS (Zero React Re-renders!)
      const montanhaX = 135 + montanhaXOffsetRef.current;
      const montanhaY = runnerYRef.current;
      const pursuerScreenX = Math.max(-80, 135 - pursuerDistRef.current * 2.4 - 40);

      if (montanhaWrapperRef.current) {
        montanhaWrapperRef.current.style.transform = `translate3d(${montanhaX}px, ${-montanhaY}px, 0)`;
      }

      if (pursuerWrapperRef.current) {
        pursuerWrapperRef.current.style.transform = `translate3d(${pursuerScreenX}px, 0, 0)`;
      }

      // 7. COMIC FLATULENCE TRIGGER (Visual puff and pursuer stun, silent & lightweight)
      if (Date.now() > nextFartTimeRef.current && !isTurboActiveRef.current) {
        setShowFartPuff(true);
        setTimeout(() => setShowFartPuff(false), 1400);

        setIsFartNearby(true);
        if (fartNearbyTimerRef.current) clearTimeout(fartNearbyTimerRef.current);
        fartNearbyTimerRef.current = window.setTimeout(() => setIsFartNearby(false), 2200);

        // Push pursuer back
        pursuerDistRef.current = Math.min(100, pursuerDistRef.current + 15);

        // Dissolve any water attacks directly behind Montanha
        attacksRef.current = attacksRef.current.filter((att) => att.x > 180 || att.x < 50);

        const randomQuote = FUNNY_SPEECHES[Math.floor(Math.random() * FUNNY_SPEECHES.length)];
        showSpeech(randomQuote, 2200);

        nextFartTimeRef.current = Date.now() + 7000 + Math.random() * 5000;
      }

      // 8. WATER ATTACKS: SPAWNING & SCHEDULING
      const screenWidth = containerRef.current ? containerRef.current.clientWidth : 800;

      if (Date.now() > nextAttackTimeRef.current && !isTurboActiveRef.current) {
        setIsAiming(true);

        const r = Math.random();
        let weapon: WaterAttackType = 'hose_low';
        if (distanceRef.current > 180 && r < 0.25) {
          weapon = 'super_jet';
        } else if (distanceRef.current > 90 && r < 0.5) {
          weapon = 'bucket_lob';
        } else if (r < 0.7) {
          weapon = 'hose_high';
        } else if (r < 0.85) {
          weapon = 'water_gun';
        } else {
          weapon = 'hose_low';
        }
        setCurrentWeapon(weapon);

        if (weapon === 'hose_low') {
          showSpeech('Jato no chão! PULA!', 1500);
        } else if (weapon === 'hose_high') {
          showSpeech('Jato no alto! ABAIXA!', 1500);
        } else if (weapon === 'bucket_lob') {
          showSpeech('Lá vem o balde d’água! 🪣', 1500);
        } else if (weapon === 'super_jet') {
          showSpeech('SUPER JATO! CUIDADO! 🚨', 1500);
        }

        setTimeout(() => {
          setIsAiming(false);
          sounds.playSurpriseHose();

          let yPos = 210;
          let width = 75;
          let height = 24;
          let speed = 360;
          let cleanPower = 8;
          let isHigh = false;
          let isLob = false;

          if (weapon === 'hose_high') {
            yPos = 145;
            isHigh = true;
            cleanPower = 8;
          } else if (weapon === 'water_gun') {
            yPos = 175;
            width = 36;
            height = 24;
            speed = 440;
            cleanPower = 6;
          } else if (weapon === 'bucket_lob') {
            yPos = 110;
            width = 44;
            height = 40;
            speed = 320;
            cleanPower = 12;
            isLob = true;
          } else if (weapon === 'super_jet') {
            yPos = 160;
            width = 110;
            height = 32;
            speed = 460;
            cleanPower = 16;
          }

          attacksRef.current.push({
            id: nextItemIdRef.current++,
            type: weapon,
            x: pursuerScreenX + 110,
            y: yPos,
            width,
            height,
            cleanPower,
            speed,
            isHigh,
            isLob,
            active: true,
          });
        }, 400);

        const delay = Math.max(3000, 5200 - (distanceRef.current / 500) * 1600);
        nextAttackTimeRef.current = Date.now() + delay;
      }

      // 9. UPDATE WATER ATTACKS & COLLISIONS
      const montanhaWidth = 65;
      for (let i = attacksRef.current.length - 1; i >= 0; i--) {
        const att = attacksRef.current[i];
        if (!att.active) continue;

        att.x += (att.speed + (isTurboActiveRef.current ? -currentSpeed : 0)) * dt;

        const crossesMontanha =
          att.x + att.width > montanhaX + 10 && att.x < montanhaX + montanhaWidth - 10;

        if (crossesMontanha && !isInvulnerableRef.current) {
          let isHit = false;

          if (isTurboActiveRef.current) {
            att.active = false;
            addFloatingText('💥 ÁGUA VAPORIZADA!', montanhaX, 130, '#84cc16');
            continue;
          }

          if (att.isHigh) {
            if (!isDuckingRef.current) isHit = true;
          } else if (att.isLob) {
            if (montanhaY < 30 && !isDuckingRef.current) isHit = true;
          } else {
            if (montanhaY < 28) isHit = true;
          }

          if (isHit) {
            att.active = false;
            sounds.playWaterHit();
            setIsWaterHit(true);
            if (waterHitTimerRef.current) clearTimeout(waterHitTimerRef.current);
            waterHitTimerRef.current = window.setTimeout(() => setIsWaterHit(false), 450);

            cleanLevelRef.current = Math.min(100, cleanLevelRef.current + att.cleanPower);
            addFloatingText(`+${att.cleanPower}% LIMPEZA! 🧼`, montanhaX + 20, 140, '#f43f5e');

            if (cleanLevelRef.current >= 100) {
              setCleanLevel(100);
              setGameState('GAME_OVER');
              return;
            }

            const hitQuote = WATER_HIT_SPEECHES[Math.floor(Math.random() * WATER_HIT_SPEECHES.length)];
            showSpeech(hitQuote, 2000);
          } else {
            // SUCCESSFUL DODGE!
            att.active = false;
            sounds.playWhooshDodge();
            scoreRef.current += 25;
            dodgesCountRef.current += 1;
            addFloatingText('DESVIO! 💨 +25', montanhaX + 20, 120, '#38bdf8');

            if (Math.random() < 0.45) {
              const dQuote = DODGE_SPEECHES[Math.floor(Math.random() * DODGE_SPEECHES.length)];
              showSpeech(dQuote, 1800);
            }
          }
        }

        if (att.x > screenWidth + 100) {
          attacksRef.current.splice(i, 1);
        }
      }

      // 10. SPAWN OBSTACLES & COLLECTIBLES
      if (lastSpawnXRef.current - deltaX < screenWidth + 200) {
        const spawnDistance = 240 + Math.random() * 180;
        const spawnX = screenWidth + spawnDistance;

        const isOverhead = Math.random() < 0.32;
        const kind = isOverhead
          ? OBSTACLE_KINDS_OVERHEAD[Math.floor(Math.random() * OBSTACLE_KINDS_OVERHEAD.length)]
          : OBSTACLE_KINDS_GROUND[Math.floor(Math.random() * OBSTACLE_KINDS_GROUND.length)];

        let width = 45;
        let height = 45;
        let y = isOverhead ? 60 : 210;

        if (isOverhead) {
          width = 50;
          height = 55;
        } else if (kind === 'puddle') {
          width = 55;
          height = 24;
        } else if (kind === 'mud_puddle') {
          width = 62;
          height = 28;
        }

        obstaclesRef.current.push({
          id: nextItemIdRef.current++,
          kind,
          x: spawnX,
          y,
          width,
          height,
          isOverhead,
        });

        if (Math.random() < 0.65) {
          const colKind = Math.random() < 0.5 ? 'rubber_duck' : Math.random() < 0.8 ? 'gold_soap' : 'deodorant_can';
          collectiblesRef.current.push({
            id: nextItemIdRef.current++,
            kind: colKind,
            x: spawnX + 90,
            y: isOverhead ? 220 : 130,
            width: 32,
            height: 32,
          });
        }

        lastSpawnXRef.current = spawnX;
      }

      // 11. MOVE OBSTACLES & DETECT COLLISION
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= deltaX;

        if (!isInvulnerableRef.current && !obs.passed) {
          const xOverlap = montanhaX + montanhaWidth > obs.x + 8 && montanhaX + 12 < obs.x + obs.width - 8;

          if (xOverlap) {
            let hit = false;
            if (obs.isOverhead) {
              if (!isDuckingRef.current) hit = true;
            } else {
              if (montanhaY < obs.height - 10) hit = true;
            }

            if (hit) {
              obs.passed = true;

              if (obs.kind === 'mud_puddle') {
                sounds.playMudSquish();
                cleanLevelRef.current = Math.max(0, cleanLevelRef.current - 8);
                scoreRef.current += 35;
                addFloatingText('LAMA! 💩 -8% LIMPEZA', montanhaX, 120, '#78350f');
                const mudQuote = MUD_SPEECHES[Math.floor(Math.random() * MUD_SPEECHES.length)];
                showSpeech(mudQuote, 2000);
              } else {
                sounds.playTrip();
                setRunnerState('tripping');
                setIsInvulnerable(true);
                isInvulnerableRef.current = true;

                if (obs.kind === 'puddle' || obs.kind === 'bucket') {
                  cleanLevelRef.current = Math.min(100, cleanLevelRef.current + 5);
                  addFloatingText('+5% LIMPEZA! 🧼', montanhaX, 120, '#f43f5e');
                }

                pursuerDistRef.current = Math.max(12, pursuerDistRef.current - 18);
                showSpeech('Opa! Tropecei!', 1800);

                setTimeout(() => {
                  setIsInvulnerable(false);
                  isInvulnerableRef.current = false;
                  setRunnerState(isTurboActiveRef.current ? 'turbo' : 'running');
                }, 1000);
              }
            }
          }
        }

        if (!obs.passed && obs.x + obs.width < montanhaX) {
          obs.passed = true;
          scoreRef.current += 15;
        }

        if (obs.x < -100) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // 12. MOVE COLLECTIBLES & DETECT PICKUP
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
              coinsRef.current += 1;
              scoreRef.current += 50;
              addFloatingText('+1 PATO 🦆', montanhaX + 20, 100, '#f59e0b');
            } else if (col.kind === 'gold_soap') {
              scoreRef.current += 30;
              addFloatingText('+30 PTS ⭐', montanhaX + 20, 100, '#eab308');
            } else if (col.kind === 'deodorant_can') {
              turboMeterRef.current = Math.min(100, turboMeterRef.current + 25);
              scoreRef.current += 40;
              addFloatingText('+25% TURBO 💨', montanhaX + 20, 100, '#84cc16');
            }
          }
        }

        if (col.x < -100) {
          collectiblesRef.current.splice(i, 1);
        }
      }

      // 13. UPDATE FLOATING TEXTS (FADE OUT)
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y -= 38 * dt; // Float up
        ft.alpha -= 0.9 * dt; // Fade out
        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // 14. 60FPS HARDWARE ACTION CANVAS DRAW (0.1ms per frame, ZERO React overhead!)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawActionCanvas(
            ctx,
            obstaclesRef.current,
            collectiblesRef.current,
            attacksRef.current,
            floatingTextsRef.current,
            canvas.width,
            canvas.height
          );
        }
      }

      // 15. THROTTLED REACT STATE UPDATE FOR HUD (~15fps, keeps main thread silky smooth)
      if (time - lastHudUpdateRef.current > 66) {
        lastHudUpdateRef.current = time;
        setDistanceMeters(Math.round(distanceRef.current));
        setTurboMeter(Math.round(turboMeterRef.current));
        setPursuerDistance(Math.round(pursuerDistRef.current));
        setCleanLevel(Math.round(cleanLevelRef.current));
        setScore(scoreRef.current);
        setCoins(coinsRef.current);
        setDodgesCount(dodgesCountRef.current);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, addFloatingText, showSpeech]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clean-up timers on unmount
  useEffect(() => {
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      if (waterHitTimerRef.current) clearTimeout(waterHitTimerRef.current);
      if (fartNearbyTimerRef.current) clearTimeout(fartNearbyTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen max-h-screen overflow-hidden select-none bg-sky-200"
      style={{ touchAction: 'none' }}
    >
      {/* Parallax Background (GPU CSS scrolling, zero re-render cost) */}
      <Fase2ParallaxBackground
        distanceMeters={distanceMeters}
        isTurbo={runnerState === 'turbo'}
      />

      {/* 60fps Hardware Canvas for Obstacles, Projectiles, Collectibles & Floating Texts */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* CHARACTERS LAYER (GPU translate3d positioning, zero layout reflows) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        <div className="absolute bottom-16 inset-x-0 h-0">
          {/* Pursuer Character Wrapper */}
          <div
            ref={pursuerWrapperRef}
            className="absolute will-change-transform"
            style={{
              left: '0px',
              bottom: '0px',
              transform: `translate3d(${Math.max(-80, 135 - pursuerDistance * 2.4 - 40)}px, 0, 0)`,
            }}
          >
            <PursuerCharacter
              currentWeapon={currentWeapon}
              isAiming={isAiming}
              isFartNearby={isFartNearby}
            />
          </div>

          {/* Montanha Character Wrapper */}
          <div
            ref={montanhaWrapperRef}
            className="absolute will-change-transform"
            style={{
              left: '0px',
              bottom: '0px',
              transform: 'translate3d(135px, 0, 0)',
            }}
          >
            {/* Comic Speech Bubble */}
            {speechText && (
              <div className="absolute -top-12 left-6 bg-white text-slate-800 text-xs font-black px-2.5 py-1.5 rounded-2xl border-2 border-sky-400 shadow-md whitespace-nowrap animate-bounce z-30">
                <span>{speechText}</span>
                <div className="absolute -bottom-1.5 left-4 w-2 h-2 bg-white border-b-2 border-r-2 border-sky-400 rotate-45" />
              </div>
            )}

            <MontanhaRunner
              state={runnerState}
              showFartPuff={showFartPuff}
              isInvulnerable={isInvulnerable}
              cleanLevel={cleanLevel}
              isWaterHit={isWaterHit}
            />
          </div>
        </div>
      </div>

      {/* TOP & CONTROLS HUD */}
      <Fase2HUD
        cleanLevel={cleanLevel}
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
          dodgesCount={dodgesCount}
          cleanLevel={cleanLevel}
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
