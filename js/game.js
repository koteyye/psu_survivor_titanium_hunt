// Импортируем необходимые модули
import { config } from './config.js';
import { preload, create, update } from './scenes/mainScene.js';

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

// Обновляем конфигурацию с импортированными функциями
const gameConfig = {
    ...config,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Создание игры
const game = new Phaser.Game(gameConfig);

// Экспортируем игру для возможного использования в других модулях
export { game };
