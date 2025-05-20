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
    
    // Восстанавливаем игрока
    window.player.clearTint();
    window.player.setPosition(400, 550);
    
    // Очищаем все предметы
    window.goodItems.clear(true, true);
    window.badItems.clear(true, true);
    window.veryGoodItems.clear(true, true);
    window.explosions.clear(true, true);
    
    // Перезапускаем фоновую музыку, если она остановлена и если музыка включена в настройках
    const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    if (musicEnabled && window.backgroundMusic && !window.backgroundMusic.isPlaying) {
        window.backgroundMusic.play();
    }
}

// Экспортируем функции
export {
    restartGame
};
