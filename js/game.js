// Импортируем необходимые модули
import { config } from './config.js';
import { MainScene } from './scenes/mainScene.js';
import { MenuScene } from './scenes/menuScene.js';
import { SettingsScene } from './scenes/settingsScene.js';
import { AboutScene } from './scenes/aboutScene.js';

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
window.score = 0;
window.health = 100;
window.gameOver = false;
window.itemSpawnTime = 0;
window.explosions = null;
window.backgroundMusic = null;
window.explosionSound = null;
window.nyamnyamSound = null;
window.gameScene = null;

// Обновляем конфигурацию с импортированными сценами
const gameConfig = {
    ...config,
    scene: [MenuScene, MainScene, SettingsScene, AboutScene]
};

// Создание игры
const game = new Phaser.Game(gameConfig);

// Версия игры теперь определяется автоматически из GitHub API в AboutScene

// Устанавливаем настройки звука и музыки включенными по умолчанию
localStorage.setItem('musicEnabled', 'true');
localStorage.setItem('soundEnabled', 'true');

// Экспортируем игру для возможного использования в других модулях
export { game };
