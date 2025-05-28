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
        
        // Создаем анимацию с учетом расположения кадров в сетке 3х4
        // Кадры идут слева направо, сверху вниз:
        // 0  1  2
        // 3  4  5
        // 6  7  8
        // 9 10 11
        scene.anims.create({
            key: 'explode',
            frames: scene.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 11,
                // Не указываем first, чтобы кадры шли по порядку от 0 до 11
            }),
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
        margin: 30,
        spacing: -38
    };
}