
import { AIDifficulty, GameState } from './types';

export const MAX_ROUNDS = 20;
export const INITIAL_BOMBS = 10;
export const INITIAL_DRYNESS = 100;
export const INITIAL_CHARGE = 100;
export const SHIELD_COST = 25;
export const CHARGE_REGEN = 10;
export const DIRECT_HIT_DAMAGE = 20;
export const MAX_SPLASH_DAMAGE = 15;
export const MIN_SPLASH_DAMAGE = 5;
export const SPLASH_RADIUS = 100;

export const GRAVITY = 0.2;
export const WIND_FACTOR = 0.005;
export const AIM_POWER_FACTOR = 0.15;
export const MAX_AIM_DISTANCE = 200;

export const PLAYER_POSITION = { x: 150, y: 500 };
export const AI_POSITION = { x: 1150, y: 500 };
export const FLAG_WIDTH = 60;
export const FLAG_HEIGHT = 100;
export const PLAYER_FLAG_POSITION = { x: 50, y: 500 };
export const AI_FLAG_POSITION = { x: 1230, y: 500 };

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GROUND_HEIGHT = 600;

export const AIR_SHIELD_SPEED = 15;
export const AIR_SHIELD_EXPLOSION_RADIUS = 50;
export const AIR_SHIELD_FUSE = 2; // seconds before self-destruct if no hit

export const AI_DIFFICULTY_SETTINGS = {
  [AIDifficulty.LEVEL_1]: { accuracyError: 50, windErrorFactor: 1.0, defenseProbability: 0.2, name: AIDifficulty.LEVEL_1, bombBonus: 0, chargeRegenBonus: 0, level: 1 },
  [AIDifficulty.LEVEL_2]: { accuracyError: 25, windErrorFactor: 0.7, defenseProbability: 0.5, name: AIDifficulty.LEVEL_2, bombBonus: 0, chargeRegenBonus: 0, level: 2 },
  [AIDifficulty.LEVEL_3]: { accuracyError: 10, windErrorFactor: 0.3, defenseProbability: 0.8, name: AIDifficulty.LEVEL_3, bombBonus: 0, chargeRegenBonus: 0, level: 3 },
  [AIDifficulty.LEVEL_4]: { accuracyError: 2, windErrorFactor: 0.1, defenseProbability: 1.0, name: AIDifficulty.LEVEL_4, bombBonus: 0, chargeRegenBonus: 0, level: 4 },
  [AIDifficulty.LEVEL_5]: { accuracyError: 0, windErrorFactor: 0.0, defenseProbability: 1.0, name: AIDifficulty.LEVEL_5, bombBonus: 5, chargeRegenBonus: 5, level: 5 },
};

export const INITIAL_GAME_STATE: GameState = {
  status: 'main-menu',
  player: { dryness: INITIAL_DRYNESS, bombs: INITIAL_BOMBS, charge: INITIAL_CHARGE, position: PLAYER_POSITION },
  ai: { dryness: INITIAL_DRYNESS, bombs: INITIAL_BOMBS, charge: INITIAL_CHARGE, position: AI_POSITION, difficulty: AIDifficulty.LEVEL_1 },
  wind: { direction: 'East', speed: 0 },
  projectiles: [],
  currentTurn: 'player',
  phase: 'aiming',
  round: 1,
  winner: null,
  aiming: { start: null, end: null, active: false, trajectory: [] },
  effects: [],
  notification: null,
  tutorialStep: 0,
};