// Базовые типы для всего проекта
export interface GameConfig {
  width: number;
  height: number;
  physics: {
    default: string;
    arcade: {
      gravity: { y: number };
      debug: boolean;
    };
  };
  scale: {
    mode: number;
    autoCenter: number;
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Size {}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type EventCallback<T = any> = (data?: T) => void;

export interface GameStats {
  score: number;
  health: number;
  maxHealth: number;
  gameOver: boolean;
  level: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface VelocityRange {
  x: [number, number];
  y: [number, number];
}

export interface ItemConfig {
  points?: number;
  damage?: number;
  healthBonus?: number;
  spawnChance: number;
  displaySize: Size;
  collisionSize: Size;
  velocityRange: VelocityRange;
  angularVelocityRange: [number, number];
}

export interface AudioConfig {
  volume: number;
  defaultEnabled: boolean;
}

export interface GameState {
  score: number;
  health: number;
  gameOver: boolean;
  isPaused: boolean;
  levelId: number;
  selectedCharacter: string;
}
