import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RunnerState, RunnerObstacle, RunnerCollectible, WaterAttack, WaterAttackType } from '../../types';
import { sounds } from '../../audio';
import { MontanhaRunner } from './MontanhaRunner';
import { PursuerCharacter } from './PursuerCharacter';
import { ObstaclesLayer } from './ObstaclesLayer';
import { WaterAttacksLayer } from './WaterAttacksLayer';
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
  // Core Gameplay States
  const [cleanLevel, setCleanLevel] = useState<number>(0); // 0% = 100% dirty, 100% = Game Over!
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [pursuerDistance, setPursuerDistance] = useState<number>(45); // meters behind (0 to 100)
  const [turboMeter, setTurboMeter] = useState<number>(30); // 0 to 100%
  const [runnerState, setRunnerState] = useState<RunnerState>('running');
  const [showFartPuff, setShowFartPuff] = useState<boolean>(false);
  const [isWaterHit, setIsWaterHit] = useState<boolean>(false);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('Banho hoje não! Fui!');
  const [gameState, setGameState] = useState<'PLAYING' | 'VICTORY' | 'GAME_OVER'>('PLAYING');
  const [dodgesCount, setDodgesCount] = useState<number>(0);

  // Pursuer Weapon State
  const [currentWeapon, setCurrentWeapon] = useState<WaterAttackType>('hose_low');
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [isFartNearby, setIsFartNearby] = useState<boolean>(false);

  // Dynamic Attacks & Floating Texts
  const [attacks, setAttacks] = useState<WaterAttack[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: number; text: string; x: number; y: number; color: string }[]
  >([]);

  // Animation & Physics Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Horizontal dynamic offset (desktop left/right)
  const montanhaXOffsetRef = useRef<number>(0); // -35 to +35 px
  const [montanhaXOffset, setMontanhaXOffset] = useState<number>(0);

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
  const attacksRef = useRef<WaterAttack[]>([]);
  const lastSpawnXRef = useRef<number>(500);
  const nextItemIdRef = useRef<number>(1);

  // Flatulence & Attack timers
  const nextFartTimeRef = useRef<number>(Date.now() + 5000);
  const nextAttackTimeRef = useRef<number>(Date.now() + 3000);
  const speechTimerRef = useRef<number | null>(null);
  const waterHitTimerRef = useRef<number | null>(null);
  const fartNearbyTimerRef = useRef<number | null>(null);

  // Floating text helper
  const addFloatingText = useCallback(
    (text: string, x: number, y: number, color = '#38bdf8') => {
      const id = Date.now() + Math.random();
      setFloatingTexts((prev) => [...prev.slice(-4), { id, text, x, y, color }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
      }, 1000);
    },
    []
  );

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

  // Ref for jump buffering (coyote time / jump buffer)
  const jumpBufferedRef = useRef<boolean>(false);

  // Jump Action with dynamic buffering
  const handleJump = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    if (isJumpingRef.current) {
      // Buffer jump if near ground
      if (runnerYRef.current < 45) {
        jumpBufferedRef.current = true;
      }
      return;
    }

    if (isDuckingRef.current) {
      isDuckingRef.current = false;
    }

    sounds.playJump();
    isJumpingRef.current = true;
    runnerVyRef.current = 14.8; // Snappy jump velocity
    setRunnerState('jumping');
  }, [gameState]);

  // Duck Action with Fast-Fall
  const handleDuckStart = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    if (isJumpingRef.current) {
      // Fast-fall: immediately dive down to avoid high jets or land quickly
      runnerVyRef.current = Math.min(runnerVyRef.current, -8.5);
      return;
    }

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

    // Vaporize on-screen water projectiles
    attacksRef.current = [];
    setAttacks([]);

    // Give Montanha major distance boost from pursuer!
    setPursuerDistance((prev) => Math.min(100, prev + 40));
    addFloatingText('🚀 GÁS TURBO ATIVADO!', 135, 120, '#84cc16');
    showSpeech('SEGURA O GÁS TURBO! 💨🚀', 3000);
  }, [gameState, turboMeter, showSpeech, addFloatingText]);

  // Keyboard controls listener (Desktop support)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuckStart();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        montanhaXOffsetRef.current = -30; // Slightly back
        setMontanhaXOffset(-30);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        montanhaXOffsetRef.current = 35; // Slightly forward
        setMontanhaXOffset(35);
      } else if (e.code === 'KeyT' || e.code === 'KeyX' || e.code === 'ShiftLeft') {
        e.preventDefault();
        handleTriggerTurbo();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        handleDuckEnd();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
        montanhaXOffsetRef.current = 0;
        setMontanhaXOffset(0);
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
    scrollOffsetRef.current = 0;
    montanhaXOffsetRef.current = 0;
    setMontanhaXOffset(0);
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    attacksRef.current = [];
    setAttacks([]);
    setFloatingTexts([]);
    lastSpawnXRef.current = 500;
    nextAttackTimeRef.current = Date.now() + 3000;
    nextFartTimeRef.current = Date.now() + 5000;
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
        : 260 + (scrollOffsetRef.current / 1800) * 15;

      const deltaX = currentSpeed * dt;
      scrollOffsetRef.current += deltaX;

      // Distance meters (1 meter = 8 pixels)
      const newMeters = scrollOffsetRef.current / 8;
      setDistanceMeters(newMeters);

      // Check Victory Condition: Survived 500 meters without hitting 100% clean!
      if (newMeters >= 500) {
        setGameState('VICTORY');
        return;
      }

      // Run cycle animation
      runCycleRef.current = (runCycleRef.current + dt * (currentSpeed / 40)) % 1;

      // JUMP PHYSICS (Delta-time normalized for ultra-smooth 60/120fps across all screens)
      if (isJumpingRef.current) {
        const timeScale = Math.min(2.5, dt * 60);
        runnerYRef.current += runnerVyRef.current * timeScale;
        runnerVyRef.current -= 0.62 * timeScale; // Smooth natural gravity

        if (runnerYRef.current <= 0) {
          runnerYRef.current = 0;
          runnerVyRef.current = 0;
          isJumpingRef.current = false;

          // Check if user pressed jump right before touching ground (jump buffer)
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

      // CHARGE TURBO GAUGE (3.5% per second)
      setTurboMeter((prev) => Math.min(100, prev + dt * 3.5));

      // PURSUER DISTANCE DYNAMICS
      setPursuerDistance((prev) => {
        let change = isTurboActiveRef.current ? dt * 10 : -dt * 0.9;
        if (newMeters > 200) change -= dt * 0.6;
        return Math.max(12, Math.min(95, prev + change));
      });

      // RANDOM COMIC FLATULENCE TRIGGER (Purely visual & silent - NO freezing audio!)
      if (Date.now() > nextFartTimeRef.current && !isTurboActiveRef.current) {
        // Comic visual puff without any audio freeze
        setShowFartPuff(true);
        setTimeout(() => setShowFartPuff(false), 1400);

        // If pursuer is within 45m, pursuer gets stunned by stink!
        setIsFartNearby(true);
        if (fartNearbyTimerRef.current) clearTimeout(fartNearbyTimerRef.current);
        fartNearbyTimerRef.current = window.setTimeout(() => setIsFartNearby(false), 2200);

        // Push pursuer back
        setPursuerDistance((prev) => Math.min(100, prev + 15));

        // Dissolve any nearby water attacks right behind Montanha
        attacksRef.current = attacksRef.current.filter((att) => att.x > 180 || att.x < 50);

        // Pick a funny quote
        const randomQuote = FUNNY_SPEECHES[Math.floor(Math.random() * FUNNY_SPEECHES.length)];
        showSpeech(randomQuote, 2200);

        // Next fart in 7 to 12 seconds
        nextFartTimeRef.current = Date.now() + 7000 + Math.random() * 5000;
      }

      // WATER ATTACKS: SPAWNING & SCHEDULING
      const screenWidth = containerRef.current ? containerRef.current.clientWidth : 800;
      const pursuerScreenX = Math.max(-60, 135 - pursuerDistance * 2.4 - 40);

      if (Date.now() > nextAttackTimeRef.current && !isTurboActiveRef.current) {
        // Prepare attack
        setIsAiming(true);

        // Pick weapon type: alternates between low hose, high hose, water gun, bucket, and super jet
        const r = Math.random();
        let weapon: WaterAttackType = 'hose_low';
        if (newMeters > 180 && r < 0.25) {
          weapon = 'super_jet';
        } else if (newMeters > 90 && r < 0.5) {
          weapon = 'bucket_lob';
        } else if (r < 0.7) {
          weapon = 'hose_high';
        } else if (r < 0.85) {
          weapon = 'water_gun';
        } else {
          weapon = 'hose_low';
        }
        setCurrentWeapon(weapon);

        // Warning sound/speech
        if (weapon === 'hose_low') {
          showSpeech('Jato no chão! PULA!', 1500);
        } else if (weapon === 'hose_high') {
          showSpeech('Jato no alto! ABAIXA!', 1500);
        } else if (weapon === 'bucket_lob') {
          showSpeech('Lá vem o balde d’água! 🪣', 1500);
        } else if (weapon === 'super_jet') {
          showSpeech('SUPER JATO! CUIDADO! 🚨', 1500);
        }

        // Fire projectile after brief aiming windup (400ms)
        setTimeout(() => {
          setIsAiming(false);
          if (gameState !== 'PLAYING') return;

          sounds.playSurpriseHose();

          let yPos = 210; // Ground
          let width = 75;
          let height = 24;
          let speed = 360;
          let cleanPower = 8;
          let isHigh = false;
          let isLob = false;

          if (weapon === 'hose_high') {
            yPos = 145; // Head/chest level
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
            x: pursuerScreenX + 110, // from pursuer's hose/hand
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

        // Schedule next attack (3.5 to 5.5s)
        const delay = Math.max(3000, 5200 - (newMeters / 500) * 1600);
        nextAttackTimeRef.current = Date.now() + delay;
      }

      // Montanha screen positions
      const montanhaX = 135 + montanhaXOffsetRef.current;
      const montanhaY = runnerYRef.current;
      const montanhaWidth = 65;
      const montanhaHeight = isDuckingRef.current ? 42 : 85;

      // UPDATE WATER ATTACKS & DETECT HIT OR DODGE
      for (let i = attacksRef.current.length - 1; i >= 0; i--) {
        const att = attacksRef.current[i];
        if (!att.active) continue;

        // Move water projectile across screen towards right
        att.x += (att.speed + (isTurboActiveRef.current ? -currentSpeed : 0)) * dt;

        // Check interaction when projectile crosses Montanha's X zone
        const crossesMontanha = att.x + att.width > montanhaX + 10 && att.x < montanhaX + montanhaWidth - 10;

        if (crossesMontanha && !isInvulnerableRef.current) {
          let isHit = false;

          if (isTurboActiveRef.current) {
            // Turbo destroys water!
            att.active = false;
            addFloatingText('💥 ÁGUA VAPORIZADA!', montanhaX, 130, '#84cc16');
            continue;
          }

          if (att.isHigh) {
            // High water jet: hits IF NOT DUCKING!
            if (!isDuckingRef.current) {
              isHit = true;
            }
          } else if (att.isLob) {
            // Parabolic bucket: hits if on ground
            if (montanhaY < 30 && !isDuckingRef.current) {
              isHit = true;
            }
          } else {
            // Ground/low water jet: hits IF NOT JUMPING!
            if (montanhaY < 28) {
              isHit = true;
            }
          }

          if (isHit) {
            att.active = false;
            sounds.playWaterHit();
            setIsWaterHit(true);
            if (waterHitTimerRef.current) clearTimeout(waterHitTimerRef.current);
            waterHitTimerRef.current = window.setTimeout(() => setIsWaterHit(false), 450);

            // Increase Cleanliness Percentage!
            setCleanLevel((prev) => {
              const updated = Math.min(100, prev + att.cleanPower);
              if (updated >= 100) {
                // GAME OVER! Montanha is 100% clean!
                setGameState('GAME_OVER');
              }
              return updated;
            });

            addFloatingText(`+${att.cleanPower}% LIMPEZA! 🧼`, montanhaX + 20, 140, '#f43f5e');

            // Comic shout
            const hitQuote = WATER_HIT_SPEECHES[Math.floor(Math.random() * WATER_HIT_SPEECHES.length)];
            showSpeech(hitQuote, 2000);
          } else {
            // SUCCESSFUL DODGE!
            att.active = false;
            sounds.playWhooshDodge();
            setScore((s) => s + 25);
            setDodgesCount((d) => d + 1);
            addFloatingText('DESVIO! 💨 +25', montanhaX + 20, 120, '#38bdf8');

            // Dodge speech occasionally
            if (Math.random() < 0.45) {
              const dQuote = DODGE_SPEECHES[Math.floor(Math.random() * DODGE_SPEECHES.length)];
              showSpeech(dQuote, 1800);
            }
          }
        }

        // Remove offscreen right
        if (att.x > screenWidth + 100) {
          attacksRef.current.splice(i, 1);
        }
      }
      setAttacks([...attacksRef.current]);

      // SPAWN OBSTACLES & COLLECTIBLES
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

        // Collectibles
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

      // MOVE OBSTACLES & DETECT COLLISIONS
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

              // SPECIAL: MUD PUDDLE GIVES DIRT BACK! (-8% Cleanliness)
              if (obs.kind === 'mud_puddle') {
                sounds.playMudSquish();
                setCleanLevel((prev) => Math.max(0, prev - 8));
                addFloatingText('LAMA! 💩 -8% LIMPEZA', montanhaX, 120, '#78350f');
                setScore((s) => s + 35);
                const mudQuote = MUD_SPEECHES[Math.floor(Math.random() * MUD_SPEECHES.length)];
                showSpeech(mudQuote, 2000);
              } else {
                // Regular obstacle trip
                sounds.playTrip();
                setRunnerState('tripping');
                setIsInvulnerable(true);
                isInvulnerableRef.current = true;

                // Penalty: Pursuer gains 18m and cleanliness might rise if soapy puddle
                if (obs.kind === 'puddle' || obs.kind === 'bucket') {
                  setCleanLevel((c) => Math.min(100, c + 5));
                  addFloatingText('+5% LIMPEZA! 🧼', montanhaX, 120, '#f43f5e');
                }

                setPursuerDistance((p) => Math.max(12, p - 18));
                showSpeech('Opa! Tropecei!', 1800);

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
        }

        if (!obs.passed && obs.x + obs.width < montanhaX) {
          obs.passed = true;
          setScore((s) => s + 15);
        }

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
              addFloatingText('+1 PATO 🦆', montanhaX + 20, 100, '#f59e0b');
            } else if (col.kind === 'gold_soap') {
              setScore((s) => s + 30);
              addFloatingText('+30 PTS ⭐', montanhaX + 20, 100, '#eab308');
            } else if (col.kind === 'deodorant_can') {
              setTurboMeter((t) => Math.min(100, t + 25));
              setScore((s) => s + 40);
              addFloatingText('+25% TURBO 💨', montanhaX + 20, 100, '#84cc16');
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
  }, [gameState, pursuerDistance, showSpeech, addFloatingText]);

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

      {/* Water Projectiles & Floating Texts Layer */}
      <WaterAttacksLayer
        attacks={attacks}
        floatingTexts={floatingTexts}
      />

      {/* CHARACTERS LAYER */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Floor Line Height: Bottom 64px */}
        <div className="absolute bottom-16 inset-x-0 h-0">
          {/* Pursuer Character Positioned by Distance */}
          <div
            className="absolute transition-none"
            style={{
              left: `${Math.max(-80, 135 - pursuerDistance * 2.4 - 40)}px`,
              bottom: '0px',
            }}
          >
            <PursuerCharacter
              distance={pursuerDistance}
              runCycle={runCycleRef.current}
              currentWeapon={currentWeapon}
              isAiming={isAiming}
              isFartNearby={isFartNearby}
            />
          </div>

          {/* Montanha Character */}
          <div
            className="absolute transition-all duration-75"
            style={{
              left: `${135 + montanhaXOffset}px`,
              bottom: `${runnerYRef.current}px`,
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
              runCycle={runCycleRef.current}
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
