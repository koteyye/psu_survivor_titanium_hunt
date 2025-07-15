/**
 * Игровые константы для PSU Survivor: Titanium Hunt
 * Убираем магические числа из кода
 */

// ========== ФИЗИКА ==========
export const PHYSICS_CONSTANTS = {
  GRAVITY: {
    LEVEL1: 350,
    LEVEL2: 350,
    LEVEL3: 400,
    DEFAULT: 350
  },
  VELOCITY: {
    PLAYER_SPEED: 200,
    ITEM_FALL_SPEED: {
      MIN: 100,
      MAX: 300
    }
  },
  DEBUG: false
} as const;

// ========== МАСШТАБИРОВАНИЕ ==========
export const SCALE_CONSTANTS = {
  MODE: Phaser.Scale.FIT,
  AUTO_CENTER: Phaser.Scale.CENTER_BOTH,
  MIN_WIDTH: 320,
  MIN_HEIGHT: 240,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080
} as const;

// ========== АУДИО ==========
export const AUDIO_CONSTANTS = {
  VOLUME: {
    DEFAULT: 0.7,
    MUSIC: 0.5,
    EFFECTS: 0.8
  },
  FADE: {
    DURATION: 1000,
    EASE: 'Linear'
  }
} as const;

// ========== ИГРОВОЙ ПРОЦЕСС ==========
export const GAMEPLAY_CONSTANTS = {
  SPAWN_RATES: {
    GOOD_PSU: 2000,    // миллисекунды
    BAD_PSU: 3000,
    VERY_GOOD_PSU: 5000
  },
  SCORES: {
    GOOD_PSU: 10,
    VERY_GOOD_PSU: 50,
    BAD_PSU_PENALTY: -20
  },
  HEALTH: {
    STARTING_HEALTH: 100,
    BAD_PSU_DAMAGE: 25,
    VERY_GOOD_PSU_HEAL: 10
  },
  KEYBOARD: {
    INPUT_DELAY: 250  // миллисекунды для предотвращения спама
  }
} as const;

// ========== UI ==========
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#00ff41',
    SECONDARY: '#0080ff',
    DANGER: '#ff4444',
    WARNING: '#ffaa00',
    SUCCESS: '#44ff44',
    BACKGROUND: '#000000',
    TEXT: '#ffffff'
  },
  FONTS: {
    DEFAULT: 'Arial',
    MONOSPACE: 'Courier New',
    SIZE: {
      SMALL: 14,
      MEDIUM: 18,
      LARGE: 24,
      XLARGE: 32
    }
  },
  ANIMATIONS: {
    BUTTON_HOVER_DURATION: 200,
    FADE_DURATION: 300,
    SLIDE_DURATION: 400
  }
} as const;

// ========== РАЗМЕРЫ ==========
export const SIZE_CONSTANTS = {
  CHARACTER: {
    DEFAULT_SCALE: 1,
    COLLISION_RADIUS: 32
  },
  ITEMS: {
    PSU: {
      WIDTH: 64,
      HEIGHT: 64,
      SCALE: 1
    }
  },
  UI: {
    BUTTON_HEIGHT: 40,
    PANEL_PADDING: 20,
    MARGIN: 10
  }
} as const;

// ========== ПУТЬ К РЕСУРСАМ ==========
export const RESOURCE_PATHS = {
  IMAGES: {
    BACKGROUNDS: 'assets/images/backgrounds/',
    GAMEPLAY: 'assets/images/gameplay/',
    UI: 'assets/ui/',
    CHARACTERS: 'assets/characters/',
    ICONS: 'assets/game_icons/'
  },
  SOUNDS: {
    MUSIC: 'assets/sounds/level_music/',
    EFFECTS: 'assets/sounds/gameplay/effects/',
    REPLICAS: 'assets/sounds/gameplay/replicas/',
    MENU: 'assets/sounds/menu/'
  },
  CONFIGS: {
    CHARACTERS: 'assets/configs/characters/',
    SPRITES: 'assets/configs/sprites/',
    LOCALIZATION: 'assets/configs/localization/'
  },
  ATLAS: {
    ROOT: 'assets/atlas/'
  }
} as const;

// ========== ВРЕМЕНА ==========
export const TIME_CONSTANTS = {
  LEVEL_DURATION: {
    LEVEL1: 60000,  // 1 минута
    LEVEL2: 90000,  // 1.5 минуты
    LEVEL3: 120000  // 2 минуты
  },
  COOLDOWNS: {
    SKILL_DEFAULT: 1000,
    ULTIMATE_SKILL: 10000,
    INTERACTION: 500
  }
} as const;

// ========== АНИМАЦИИ ==========
export const ANIMATION_CONSTANTS = {
  FRAMERATES: {
    DEFAULT: 10,
    FAST: 15,
    SLOW: 5
  },
  REPEAT: {
    LOOP: -1,
    ONCE: 0
  }
} as const;

// ========== ПРОИЗВОДИТЕЛЬНОСТЬ ==========
export const PERFORMANCE_CONSTANTS = {
  OBJECT_POOL: {
    DEFAULT_SIZE: 20,
    EXPLOSION_POOL_SIZE: 10,
    EFFECT_POOL_SIZE: 15
  },
  UPDATE_INTERVALS: {
    UI_UPDATE: 100,      // миллисекунды
    STATS_UPDATE: 500,
    CLEANUP: 5000
  }
} as const;