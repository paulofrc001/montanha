export type GamePhase = 'PHASE_1_BATH' | 'PHASE_2_ESCAPE';

export type GameStage = 'SOAP' | 'SCRUB' | 'RINSE' | 'TOWEL' | 'DEODORANT';

export type DodgePose = 'normal' | 'lean_left' | 'lean_right' | 'guard_belly' | 'raise_arms' | 'turn_away' | 'duck';

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
  dried: number; // 0.0 to 1.0 (towel drying)
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

// --- FASE 2: FUGA DO BANHO TYPES ---
export type RunnerState = 'running' | 'jumping' | 'ducking' | 'tripping' | 'turbo' | 'captured';

export type ObstacleKind = 
  | 'bucket'          // balde com água e sabão (chão)
  | 'soap_slip'       // sabonete escorregadio no chão (chão)
  | 'puddle'          // poça d'água ensaboada (chão)
  | 'duck'            // patinho de borracha (chão)
  | 'box'             // caixa de papelão (chão)
  | 'laundry_basket'  // cesto de roupas sujas (chão)
  | 'towel_hanging'   // toalha pendurada no varal/porta (alto - abaixar!)
  | 'flying_sponge'   // bucha voando / arremessada (alto - abaixar!)
  | 'shower_hose';    // mangueira esticada (alto ou médio)

export interface RunnerObstacle {
  id: number;
  kind: ObstacleKind;
  x: number;          // position in pixels
  y: number;          // vertical position (ground or air)
  width: number;
  height: number;
  isOverhead: boolean; // if true, must duck under; if false, must jump over
  passed?: boolean;
}

export type CollectibleKind = 'rubber_duck' | 'gold_soap' | 'deodorant_can';

export interface RunnerCollectible {
  id: number;
  kind: CollectibleKind;
  x: number;
  y: number;
  width: number;
  height: number;
  collected?: boolean;
}

export type DomesticZone = 'bathroom' | 'hallway' | 'living_room' | 'kitchen' | 'backyard';

export interface DomesticZoneInfo {
  id: DomesticZone;
  name: string;
  icon: string;
  startMeters: number;
  endMeters: number;
  bgGradient: string;
  floorColor: string;
  wallDecor: string;
}

