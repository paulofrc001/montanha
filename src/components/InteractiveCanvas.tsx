import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameStage, DirtZone, Particle } from '../types';
import { sounds } from '../audio';

interface InteractiveCanvasProps {
  stage: GameStage;
  zones: DirtZone[];
  onZoneInteract: (zoneId: string, amount: number) => void;
  onScrubbingStateChange: (isScrubbing: boolean) => void;
  isGameOver: boolean;
  isVictory: boolean;
  onCharacterReaction: (reaction: string) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  stage,
  zones,
  onZoneInteract,
  onScrubbingStateChange,
  isGameOver,
  isVictory,
  onCharacterReaction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const lastSoundTimeRef = useRef<number>(0);
  const lastReactionTimeRef = useRef<number>(0);

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // Particles state managed in a ref for smooth 60fps rendering without React re-render lag
  const particlesRef = useRef<Particle[]>([]);

  // Spawn dynamic particles
  const spawnParticle = useCallback((x: number, y: number, type: Particle['type'], count = 1) => {
    for (let i = 0; i < count; i++) {
      let vx = (Math.random() - 0.5) * 4;
      let vy = (Math.random() - 0.5) * 4;
      let size = 8 + Math.random() * 12;
      let life = 0;
      let maxLife = 40 + Math.random() * 30;
      let color = '#ffffff';

      if (type === 'bubble') {
        vy = -0.5 - Math.random() * 1.5; // bubbles drift upward
        vx = (Math.random() - 0.5) * 2;
        size = 10 + Math.random() * 16;
        color = '#e0f2fe';
        maxLife = 50 + Math.random() * 40;
      } else if (type === 'water') {
        vy = 3 + Math.random() * 4; // water falls down
        vx = (Math.random() - 0.5) * 3;
        size = 4 + Math.random() * 7;
        color = '#38bdf8';
        maxLife = 35 + Math.random() * 20;
      } else if (type === 'spray') {
        vx = (Math.random() - 0.5) * 6;
        vy = (Math.random() - 0.5) * 6;
        size = 3 + Math.random() * 6;
        color = '#a7f3d0';
        maxLife = 25 + Math.random() * 15;
      } else if (type === 'sparkle') {
        vx = (Math.random() - 0.5) * 3;
        vy = -1 - Math.random() * 2;
        size = 6 + Math.random() * 10;
        color = Math.random() > 0.5 ? '#fde047' : '#f472b6';
        maxLife = 35 + Math.random() * 20;
      }

      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx,
        vy,
        size,
        color,
        life,
        maxLife,
        type,
      });
    }

    // Cap max particles to keep smooth 60fps
    if (particlesRef.current.length > 250) {
      particlesRef.current = particlesRef.current.slice(-200);
    }
  }, []);

  // Main interaction handler when moving pointer over canvas
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (isGameOver || isVictory || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setCursorPos({ x, y });

    if (!isPointerDownRef.current) return;

    // Convert pixel position to 0-100% relative coordinates
    const relX = (x / rect.width) * 100;
    const relY = (y / rect.height) * 100;

    const now = Date.now();

    // Check collision with zones
    let hitAnyZone = false;
    zones.forEach((zone) => {
      const dx = relX - zone.x;
      const dy = relY - zone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Interaction radius
      const threshold = zone.radius * 0.9 + 6;
      if (dist < threshold) {
        hitAnyZone = true;
        // Interaction intensity
        const amount = 0.055;
        onZoneInteract(zone.id, amount);
      }
    });

    // Sound and particle trigger
    if (now - lastSoundTimeRef.current > 75) {
      lastSoundTimeRef.current = now;

      if (stage === 'SOAP') {
        sounds.playBubblePop();
        spawnParticle(x, y, 'bubble', 4);
      } else if (stage === 'SCRUB') {
        sounds.playScrub();
        spawnParticle(x, y, 'bubble', 5);
      } else if (stage === 'RINSE') {
        sounds.playWaterSplash();
        spawnParticle(x, y, 'water', 7);
      } else if (stage === 'DEODORANT') {
        sounds.playSpray();
        sounds.playSparkle();
        spawnParticle(x, y, 'spray', 5);
        spawnParticle(x, y, 'sparkle', 2);
      }
    }

    // Occasional fun character reaction
    if (hitAnyZone && now - lastReactionTimeRef.current > 3800) {
      lastReactionTimeRef.current = now;
      if (stage === 'SOAP') {
        const reactions = [
          'Hahaha, que cócegas na pança!',
          'Hmm, cheirinho gostoso de sabão!',
          'Muita espuma, que delícia!',
          'Passa debaixo do braço também!',
        ];
        onCharacterReaction(reactions[Math.floor(Math.random() * reactions.length)]);
      } else if (stage === 'SCRUB') {
        const reactions = [
          'Ai que alívio, esfrega bem!',
          'Sai sujeira feia!',
          'Tava precisando dessa bucha!',
          'Xô mosquitada, sai pra lá!',
        ];
        onCharacterReaction(reactions[Math.floor(Math.random() * reactions.length)]);
      } else if (stage === 'RINSE') {
        const reactions = [
          'Ufa, que água quentinha e boa!',
          'Lá vai embora a espumolada!',
          'Tô ficando limpinho da silva!',
          'Que banho refrescante!',
        ];
        onCharacterReaction(reactions[Math.floor(Math.random() * reactions.length)]);
      } else if (stage === 'DEODORANT') {
        const reactions = [
          'Suvaco blindado por 48 horas!',
          'Cheirinho de galã de novela!',
          'Nossa, agora fiquei nos trinques!',
          'Tô pronto pro casamento ou pro pagode!',
        ];
        onCharacterReaction(reactions[Math.floor(Math.random() * reactions.length)]);
      }
    }
  }, [isGameOver, isVictory, stage, zones, onZoneInteract, spawnParticle, onCharacterReaction]);

  // Pointer event listeners
  const onPointerDown = (e: React.PointerEvent) => {
    if (isGameOver || isVictory) return;
    isPointerDownRef.current = true;
    setIsInteracting(true);
    onScrubbingStateChange(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    handleInteraction(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    isPointerDownRef.current = false;
    setIsInteracting(false);
    onScrubbingStateChange(false);
  };

  const onPointerLeave = () => {
    isPointerDownRef.current = false;
    setIsInteracting(false);
    onScrubbingStateChange(false);
    setCursorPos(null);
  };

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        const alpha = Math.max(0, 1 - progress);

        if (p.type === 'bubble') {
          // Cartoon soap bubble with white highlight
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${alpha * 0.75})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Highlight
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.35, p.y - p.size * 0.35, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.fill();
        } else if (p.type === 'water') {
          // Teardrop water droplet
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size * 0.6, p.size * 1.2, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
          ctx.fill();
        } else if (p.type === 'spray') {
          // Fine mist
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 243, 208, ${alpha * 0.65})`;
          ctx.fill();
        } else if (p.type === 'sparkle') {
          // Four-pointed star
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(progress * Math.PI);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
          ctx.restore();
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    // Resize canvas to match display size
    const updateCanvasSize = () => {
      if (containerRef.current && canvas) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Tool visual representation
  const renderToolIcon = () => {
    switch (stage) {
      case 'SOAP':
        return (
          <div className="relative w-16 h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none filter drop-shadow-lg">
            {/* Pink cartoon soap bar */}
            <div className="w-14 h-11 bg-gradient-to-br from-pink-300 via-pink-400 to-rose-400 rounded-2xl border-2 border-pink-500 flex items-center justify-center shadow-md transform rotate-[-8deg]">
              <span className="text-white text-xs font-bold tracking-wider opacity-90">SABÃO</span>
            </div>
            {/* Soap bubbles clinging to bar */}
            <span className="absolute -top-1 -right-1 text-base">🫧</span>
            <span className="absolute -bottom-1 -left-1 text-sm">🫧</span>
          </div>
        );
      case 'SCRUB':
        return (
          <div className="relative w-16 h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none filter drop-shadow-lg">
            {/* Yellow Sponge with pores */}
            <div className="w-13 h-13 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-2xl border-2 border-amber-600 flex flex-wrap p-1.5 gap-1 items-center justify-center shadow-md transform rotate-6">
              <div className="w-2 h-2 rounded-full bg-amber-600/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600/30" />
              <div className="w-3 h-3 rounded-full bg-amber-600/40" />
            </div>
            <span className="absolute -top-2 -right-1 text-base">🧽</span>
          </div>
        );
      case 'RINSE':
        return (
          <div className="relative w-16 h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none filter drop-shadow-lg">
            {/* Shower head with spray lines */}
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-cyan-600 flex items-center justify-center shadow-md">
              <span className="text-2xl">🚿</span>
            </div>
            {/* Water spray drops */}
            {isInteracting && (
              <div className="absolute top-10 left-8 text-sky-400 text-xs animate-bounce font-bold">
                💧💧
              </div>
            )}
          </div>
        );
      case 'DEODORANT':
        return (
          <div className="relative w-16 h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none filter drop-shadow-lg">
            {/* Deodorant spray can */}
            <div className="w-8 h-14 bg-gradient-to-b from-slate-200 via-teal-400 to-emerald-500 rounded-t-lg rounded-b-xl border-2 border-teal-700 flex flex-col items-center justify-between p-1 shadow-md transform -rotate-12">
              <div className="w-3 h-2 bg-emerald-700 rounded-t" />
              <span className="text-[9px] font-black text-white">48h</span>
              <div className="w-5 h-1 bg-white/40 rounded-full" />
            </div>
            {isInteracting && (
              <span className="absolute -top-3 -right-3 text-lg animate-ping">✨</span>
            )}
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none z-20"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
      />

      {/* Floating active tool follower */}
      {cursorPos && (
        <div
          className="pointer-events-none absolute transition-transform duration-75 ease-out"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: `scale(${isInteracting ? 1.15 : 1.0})`,
          }}
        >
          {renderToolIcon()}
        </div>
      )}
    </div>
  );
};
