// Утилиты для работы с анимациями

/**
 * Создает анимацию взрыва
 * @param {Phaser.Scene} scene - Сцена, в которой создается анимация
 * @returns {boolean} - Успешно ли создана анимация
 */
export function createExplosionAnimation(scene) {
    if (!scene) {
        console.warn('Сцена не найдена');
        return false;
    }
    
    try {
        // Удаляем существующую анимацию, если она есть
        if (scene.anims.exists('explode')) {
            scene.anims.remove('explode');
        }
        
        // Создаем анимацию с явным указанием порядка кадров
        scene.anims.create({
            key: 'explode',
            frames: [
                { key: 'explosion', frame: 0 },
                { key: 'explosion', frame: 1 },
                { key: 'explosion', frame: 2 },
                { key: 'explosion', frame: 3 },
                { key: 'explosion', frame: 4 },
                { key: 'explosion', frame: 5 },
                { key: 'explosion', frame: 6 },
                { key: 'explosion', frame: 7 },
                { key: 'explosion', frame: 8 },
                { key: 'explosion', frame: 9 },
                { key: 'explosion', frame: 10 },
                { key: 'explosion', frame: 11 }
            ],
            frameRate: 15,
            repeat: 0
        });
        
        console.log('Анимация взрыва успешно создана');
        return true;
    } catch (error) {
        console.error('Ошибка при создании анимации взрыва:', error);
        console.error(error.stack);
        return false;
    }
}

/**
 * Настройки для загрузки спрайтшита взрыва
 * @returns {Object} - Объект с настройками
 */
export function getExplosionSpriteConfig() {
    // Размер файла 1024x1536, разбиваем на сетку 3x4 кадра
    return {
        frameWidth: 341, // Фиксированное значение (1024 / 3 ≈ 341.33)
        frameHeight: 384, // Фиксированное значение (1536 / 4 = 384)
        margin: 0,
        spacing: 0
    };
}