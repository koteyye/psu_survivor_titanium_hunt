import * as Phaser from 'phaser';
import { gameConfig } from './config';
import type { PhaserConfig } from './core/types';

// Импорты сцен из новой структуры
import {
  MenuScene,
  CharacterSelectScene
} from './game/scenes/ui/MenuScene';
import {
  LevelSelectScene,
  SettingsScene,
  AboutScene
} from './game/scenes/ui/GameUIScenes';
import {
  MainScene,
  Level2Scene,
  Level3Scene
} from './game/scenes/levels/GameLevels';

class GameApp {
  private phaserGame: Phaser.Game;

  constructor() {
    const config: PhaserConfig = {
      ...gameConfig,
      type: Phaser.AUTO,
      parent: 'game-container',
      backgroundColor: '#000000',
      dom: {
        createContainer: true
      },
      scene: [
        MenuScene,
        CharacterSelectScene,
        LevelSelectScene,
        SettingsScene,
        AboutScene,
        MainScene,
        Level2Scene,
        Level3Scene
      ]
    };

    console.log('Initializing game with config:', config);
    
    // Создаем настоящую игру Phaser
    this.phaserGame = new Phaser.Game(config);
    
    // Инициализируем утилиты
    this.initializeUtilities();
    
    console.log('Game initialized successfully');
  }

  private initializeUtilities(): void {
    console.log('🔧 Initializing game utilities...');
    
    // Инициализация игровых систем
    try {
      // TODO: Добавить инициализацию менеджеров когда они будут готовы
      console.log('Game systems initialized');
    } catch (error) {
      console.warn('Error initializing game systems:', error);
    }
    
    console.log('✅ Utilities initialized successfully');
  }

  public getGame(): Phaser.Game {
    return this.phaserGame;
  }

  public destroy(): void {
    if (this.phaserGame && this.phaserGame.destroy) {
      this.phaserGame.destroy(true);
    }
  }
}

// Инициализация игры
let gameInstance: GameApp | null = null;

export function initializeGame(): GameApp {
  if (!gameInstance) {
    gameInstance = new GameApp();
  }
  return gameInstance;
}

export function getGame(): GameApp | null {
  return gameInstance;
}

export { GameApp };

// Глобальная обработка ошибок
window.onerror = (msg, src, lineno, colno, error) => {
  console.error('🚨 Глобальная ошибка:', msg, error);
  console.error('📍 Файл:', src, 'Строка:', lineno, 'Колонка:', colno);
  return false;
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Необработанное отклонение промиса:', event.reason);
});

// Инициализируем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 DOM loaded, initializing game...');
  try {
    initializeGame();
    console.log('✅ Game initialization completed');
  } catch (error) {
    console.error('❌ Failed to initialize game:', error);
  }
});
