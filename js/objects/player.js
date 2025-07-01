// Функции для работы с игроком
import { ConfigManager, EventManager, AudioManager, ObjectPoolManager } from '../managers/index.js';

/**
 * Функция перезапуска игры
 * @param {Phaser.Scene} scene - Сцена игры
 */
function restartGame(scene) {
    // Получаем менеджеры
    const configManager = ConfigManager.getInstance();
    const eventManager = EventManager.getInstance();
    const audioManager = AudioManager.getInstance();
    const objectPoolManager = ObjectPoolManager.getInstance();
    
    // Сбрасываем переменные через Registry вместо window.*
    scene.registry.set('score', 0);
    scene.registry.set('health', configManager.getValue('core', 'player.defaultHealth', 100));
    scene.registry.set('gameOver', false);
      // Скрываем элементы Game Over
    if (scene && scene.gameOverTitle) {
        scene.gameOverTitle.setVisible(false);
    }
    if (scene && scene.restartText) {
        scene.restartText.setVisible(false);
    }
    if (scene && scene.gameOverBackground) {
        scene.gameOverBackground.setVisible(false);
    }
    
    // Обновляем UI через Event Bus
    eventManager.emit('UI_UPDATE', { 
        score: scene.registry.get('score'),
        health: scene.registry.get('health')
    });
    
    // Удаляем текст подтверждения перезапуска, если он есть
    if (scene.confirmRestartText) {
        scene.confirmRestartText.destroy();
        scene.confirmRestartText = null;
    }
    
    // Восстанавливаем игрока
    const player = scene.registry.get('playerSprite');
    if (player) {
        player.clearTint();
        player.setPosition(960, 900);
        player.setVelocity(0, 0); // Сбрасываем скорость игрока
        player.setAngle(0); // Сбрасываем угол наклона
        
        // Явно включаем физику для игрока
        if (player.body) {
            player.body.enable = true;
        }
    }
    
    // Сбрасываем состояние персонажа, если используется новая система
    const gameCharacter = scene.registry.get('gameCharacter');
    if (gameCharacter) {
        // Сбрасываем специфические для персонажа состояния
        if (gameCharacter.resetCombo) {
            gameCharacter.resetCombo();
        }
        
        if (gameCharacter.deactivateRageMode) {
            gameCharacter.deactivateRageMode();
        }
        
        // Оповещаем о сбросе персонажа через Event Bus
        eventManager.emit('CHARACTER_RESET', gameCharacter);
    }
    
    // Полностью уничтожаем все пулы предметов (для предотвращения ошибок при повторном запуске)
    objectPoolManager.destroyAllPools();
    
    // Перезапускаем фоновую музыку, если она остановлена и если музыка включена в настройках
    if (audioManager.musicEnabled && scene.registry.get('currentMusic')) {
        audioManager.playMusic(scene.registry.get('currentMusic'));
    }
    
    // Сбрасываем время спавна предметов
    scene.registry.set('itemSpawnTime', 0);
    
    // Всегда возобновляем физику при перезапуске
    scene.physics.resume();
    
    // Сбрасываем состояние паузы
    if (scene.isPaused) {
        scene.isPaused = false;
        
        // Скрываем текст паузы, если он есть
        if (scene.pauseText) {
            scene.pauseText.visible = false;
        }
        
        // Скрываем текст продолжения, если он есть
        if (scene.resumeText) {
            scene.resumeText.visible = false;
        }
    }
    
    // Оповещаем о перезапуске игры через Event Bus
    eventManager.emit('GAME_RESTART');
    
    console.log('Игра перезапущена!');
}

// Экспортируем функции
export {
    restartGame
};
