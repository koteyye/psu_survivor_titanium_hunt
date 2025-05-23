// Функции для работы с игроком

// Функция перезапуска игры
function restartGame(scene) {
    // Сбрасываем переменные
    window.score = 0;
    window.health = 100;
    window.gameOver = false;
    
    // Обновляем текст
    window.scoreText.setText('Очки: 0');
    window.healthText.setText('Здоровье: 100');
    window.gameOverText.visible = false;
    window.restartText.visible = false;
    
    // Удаляем текст подтверждения перезапуска, если он есть
    if (window.confirmRestartText) {
        window.confirmRestartText.destroy();
        window.confirmRestartText = null;
    }
    
    // Восстанавливаем игрока
    window.player.clearTint();
    window.player.setPosition(960, 900);
    window.player.setVelocity(0, 0); // Сбрасываем скорость игрока
    window.player.setAngle(0); // Сбрасываем угол наклона
    
    // Сбрасываем скорость и очищаем все предметы
    [window.goodItems, window.badItems, window.veryGoodItems].forEach(group => {
        if (group && group.getChildren) {
            // Сначала сбрасываем скорость всех предметов
            group.getChildren().forEach(item => {
                if (item && item.active) {
                    item.setVelocity(0, 0);
                    item.setAngularVelocity(0);
                }
            });
        }
        // Затем очищаем группу
        if (group && group.clear) {
            group.clear(true, true);
        }
    });
    
    // Очищаем группу взрывов, если она существует
    if (window.explosions && window.explosions.clear) {
        window.explosions.clear(true, true);
    }
    
    // Перезапускаем фоновую музыку, если она остановлена и если музыка включена в настройках
    const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    if (musicEnabled && window.backgroundMusic && !window.backgroundMusic.isPlaying) {
        window.backgroundMusic.play();
    }
    
    // Сбрасываем время спавна предметов
    window.itemSpawnTime = 0;
    
    // Всегда возобновляем физику при перезапуске
    scene.physics.resume();
    
    // Явно включаем физику для игрока
    window.player.body.enable = true;
    
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
    
    console.log('Игра перезапущена!');
}

// Экспортируем функции
export {
    restartGame
};
