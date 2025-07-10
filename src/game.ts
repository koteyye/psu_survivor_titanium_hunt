import * as Phaser from 'phaser';
import { gameConfig } from './config';
import type { PhaserConfig } from './types/phaser-extensions';
// import { projectOptimizer, UIScaler } from './utils';

// Импорты сцен
import { 
  MenuScene, 
  CharacterSelectScene 
} from './scenes/ui/MenuScene';
import { 
  LevelSelectScene, 
  SettingsScene, 
  AboutScene 
} from './scenes/ui/GameUIScenes';
import {
  MainScene,
  Level2Scene,
  Level3Scene
} from './scenes/levels/GameLevels';

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
    
    // Временные заглушки для отсутствующих утилит
    try {
      // Инициализируем оптимизатор проекта
      // if (projectOptimizer && typeof projectOptimizer.init === 'function') {
      //   projectOptimizer.init();
      //   
      //   // Логируем статистику проекта
      //   const stats = projectOptimizer.getProjectStats();
      //   console.log(`📊 Project Stats: ${stats.typescriptFiles}/${stats.totalFiles} files migrated to TypeScript (${stats.migrationProgress}%)`);
      //   
      //   // Логируем отчет об очистке
      //   const cleanupReport = projectOptimizer.getCleanupReport();
      //   console.log('🧹 Cleanup Report:', cleanupReport);
      // }
    } catch (error) {
      console.warn('ProjectOptimizer not available:', error);
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

// Инициализируем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  initializeGame();
});
