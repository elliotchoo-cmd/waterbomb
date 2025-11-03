
export enum AIDifficulty {
  LEVEL_1 = "Splish Splash",
  LEVEL_2 = "Spray and Pray",
  LEVEL_3 = "Power Shower",
  LEVEL_4 = "Super Soaker",
  LEVEL_5 = "Wet and Wild",
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Player {
  dryness: number;
  bombs: number;
  charge: number;
  position: Coordinates;
}

export interface AI {
  dryness: number;
  bombs: number;
  charge: number;
  position: Coordinates;
  difficulty: AIDifficulty;
}

export interface Wind {
  direction: 'East' | 'West';
  speed: number;
}

export type ProjectileType = 'water-bomb' | 'air-shield';

export interface ProjectileData {
  id: string;
  type: ProjectileType;
  position: Coordinates;
  velocity: Coordinates;
  owner: 'player' | 'ai';
  target?: Coordinates;
  explosionRadius?: number;
  exploded?: boolean;
  explosionTimer?: number;
}

export type GameStatus = 'main-menu' | 'playing' | 'game-over';
export type Turn = 'player' | 'ai';
export type Phase = 'aiming' | 'defending' | 'resolving' | 'transition';

export interface AimingState {
  start: Coordinates | null;
  end: Coordinates | null;
  active: boolean;
  trajectory: Coordinates[];
}

export interface GameState {
  status: GameStatus;
  player: Player;
  ai: AI;
  wind: Wind;
  projectiles: ProjectileData[];
  currentTurn: Turn;
  phase: Phase;
  round: number;
  winner: 'player' | 'ai' | 'draw' | null;
  aiming: AimingState;
  effects: GameEffect[];
  notification: string | null;
  tutorialStep: number;
}

export type GameEffectType = 'SPLOOSH' | 'INTERCEPT' | '+1 BOMB' | 'MISS';

export interface GameEffect {
    id: string;
    type: GameEffectType;
    position: Coordinates;
    text: string;
}