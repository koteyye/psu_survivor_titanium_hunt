import * as Phaser from 'phaser';
import type { GameConfig } from './types/common';

export const gameConfig: GameConfig = {
  width: 1920,
  height: 1080,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export const GAME_CONSTANTS = {
  MAX_HEALTH: 100,
  DEFAULT_SPEED: 200,
  ITEM_SPAWN_RATE: 2000,
  EXPLOSION_DURATION: 1000,
  
  // Размеры игрока
  PLAYER: {
    WIDTH: 64,
    HEIGHT: 64,
    COLLISION_WIDTH: 32,
    COLLISION_HEIGHT: 32
  },
  
  // Настройки уровней
  LEVELS: {
    COUNT: 3,
    DEFAULT_DURATION: 120000, // 2 минуты
    SPAWN_RATES: {
      GOOD: 1000,
      BAD: 1500,
      VERY_GOOD: 3000
    }
  },
  
  // Настройки UI
  UI: {
    CYBER_GLOW_COLOR: 0x00ffff,
    CYBER_PRIMARY_COLOR: 0x0099cc,
    CYBER_SECONDARY_COLOR: 0x003366,
    FONT_FAMILY: 'Arial, sans-serif'
  }
} as const;
