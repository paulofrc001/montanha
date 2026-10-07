export type GameStage = 'SOAP' | 'SCRUB' | 'RINSE' | 'DEODORANT';

export interface DirtZone {
  id: string;
  x: number; // percentage 0-100 relative to character container
  y: number;
  radius: number;
  initialDirt: number; // 1.0 = fully dirty
  currentDirt: number;
  foamed: number; // 0.0 to 1.0 (soap coverage)
  scrubbed: number; // 0.0 to 1.0
  rinsed: number; // 0.0 to 1.0
  deodorized: number; // 0.0 to 1.0
  label: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'bubble' | 'water' | 'spray' | 'sparkle' | 'stink';
  scale?: number;
}

export type GameStatus = 'TITLE' | 'PLAYING' | 'VICTORY' | 'GAME_OVER';

export interface ToolDef {
  id: GameStage;
  name: string;
  icon: string;
  color: string;
  desc: string;
  actionText: string;
}
