import { GameLevelScene } from "@/scenes/base/GameLevelScene";

export interface ResourceConfig {
  key: string;
  type: 'image' | 'audio' | 'atlas';
  path: string;
  atlasConfig?: string;
  conditional?: (scene: GameLevelScene) => boolean;
}

export interface LevelResourcesConfig {
  [levelId: string]: {
    background: string;
    music: string;
    images: ResourceConfig[];
    sounds: ResourceConfig[];
    atlases: ResourceConfig[];
  };
}

export const LEVEL_RESOURCES_CONFIG: LevelResourcesConfig = {
  common: {
    background: '',
    music: '',
    images: [
      { key: 'player', type: 'image', path: 'src/assets/images/gameplay/player.png' },
      { key: 'goodItem', type: 'image', path: 'src/assets/images/gameplay/good_psu.png' },
      { key: 'badItem', type: 'image', path: 'src/assets/images/gameplay/bad_psu.png' },
      { key: 'veryGoodItem', type: 'image', path: 'src/assets/images/gameplay/very_good_psu.png' },
      { key: 'explosion', type: 'image', path: 'src/assets/images/gameplay/explosion.png' },
      // UI иконки
      { key: 'healthIcon', type: 'image', path: 'src/assets/game_icons/health.png' },
      { key: 'scoreIcon', type: 'image', path: 'src/assets/game_icons/score.png' },
      { key: 'moneyIcon', type: 'image', path: 'src/assets/game_icons/money.png' },
      { key: 'rageIcon', type: 'image', path: 'src/assets/game_icons/rage.png' },
      { key: 'basketIcon', type: 'image', path: 'src/assets/game_icons/backet.png' }
    ],
    sounds: [
      { key: 'explosionSound', type: 'audio', path: 'src/assets/sounds/gameplay/effects/explosion.wav' }
    ],
    atlases: [
      { 
        key: 'good_super', 
        type: 'atlas', 
        path: 'src/assets/images/gameplay/explosions/good_super.png',
        atlasConfig: 'src/assets/configs/sprites/good_super.json'
      },
      { 
        key: 'bad_money', 
        type: 'atlas', 
        path: 'src/assets/images/gameplay/explosions/bad_money.png',
        atlasConfig: 'src/assets/configs/sprites/bad_money.json'
      }
    ]
  },
  level1: {
    background: 'src/assets/images/backgrounds/background_level1.png',
    music: 'src/assets/sounds/level_music/level1_music.wav',
    images: [],
    sounds: [],
    atlases: []
  },
  level2: {
    background: 'src/assets/images/backgrounds/background_level2.png',
    music: 'src/assets/sounds/level_music/level2_music.wav',
    images: [],
    sounds: [],
    atlases: []
  },
  level3: {
    background: 'src/assets/images/backgrounds/background_level3.png',
    music: 'src/assets/sounds/level_music/level3_music.wav',
    images: [],
    sounds: [],
    atlases: []
  }
};

export const CHARACTER_RESOURCES_CONFIG = {
  characters: ['friender_s', 'trader', 'zummer'],
  soundTypes: ['collect', 'hit', 'special', 'select']
};