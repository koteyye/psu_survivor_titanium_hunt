// Импортируем необходимые модули
import { config } from './config.js';
import { MainScene, Level2Scene, Level3Scene } from './scenes/levels/game_levels.js';
import { MenuScene } from './scenes/ui/menuScene.js';
import { SettingsScene } from './scenes/ui/settingsScene.js';
import { AboutScene } from './scenes/ui/aboutScene.js';
import { LevelSelectScene } from './scenes/ui/levelSelectScene.js';
import { CharacterSelectScene } from './scenes/ui/characterSelectScene.js';

// Глобальные переменные
window.player = null;
window.goodItems = null;
window.badItems = null;
window.veryGoodItems = null;
window.cursors = null;
window.scoreText = null;
window.healthText = null;
window.gameOverText = null;
window.restartText = null;
window.confirmRestartText = null;
window.score = 0;
window.health = 100;
window.gameOver = false;
window.itemSpawnTime = 0;
window.explosions = null;
window.backgroundMusic = null;
window.menuMusic = null;
window.explosionSound = null;
// Звук nyamnyamSound больше не используется
window.gameScene = null;
window.rKey = null;
window.escKey = null;

// Обновляем конфигурацию с импортированными сценами
const gameConfig = {
    ...config,
    scene: [MenuScene, CharacterSelectScene, MainScene, Level2Scene, Level3Scene, SettingsScene, AboutScene, LevelSelectScene]
};

// Инициализируем менеджеры уровней и прогресса
console.log('Инициализация менеджеров уровней и прогресса...');

// Создание игры
const game = new Phaser.Game(gameConfig);

// Версия игры теперь определяется автоматически из GitHub API в AboutScene

// Устанавливаем настройки звука и музыки включенными по умолчанию
localStorage.setItem('musicEnabled', 'true');
localStorage.setItem('soundEnabled', 'true');

// Экспортируем игру для возможного использования в других модулях
export { game };
