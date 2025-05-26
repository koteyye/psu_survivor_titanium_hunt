// Конфигурация игры
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // Добавляем плагины для UI элементов
    dom: {
        createContainer: true
    },
    plugins: {
        scene: [
            {
                key: 'rexUI',
                plugin: window.rexUI,
                mapping: 'rexUI'
            }
        ]
    }
};

// Экспортируем конфигурацию
export { config };
