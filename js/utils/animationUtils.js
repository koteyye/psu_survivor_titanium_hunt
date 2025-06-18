// Утилиты для работы с анимациями

/**
 * Создает анимации взрывов для разных типов блоков
 * @param {Phaser.Scene} scene - Сцена, в которой создаются анимации
 * @returns {boolean} - Успешно ли созданы анимации
 */
export function createExplosionAnimation(scene) {
    if (!scene) {
        console.warn('Сцена не найдена');
        return false;
    }
    
    try {
        
        // Удаляем существующие анимации, если они есть
        const animKeys = ['explode', 'good_explode', 'super_explode', 'money_explode'];
        animKeys.forEach(key => {
            if (scene.anims.exists(key)) {
                scene.anims.remove(key);
            }
        });
        
        // Создаем анимацию для плохих блоков с использованием новых кадров
        scene.anims.create({
            key: 'explode',
            frames: [
                { key: 'bad_money', frame: 'bad_exposion_1.png' },
                { key: 'bad_money', frame: 'bad_exposion_2.png' },
                { key: 'bad_money', frame: 'bad_exposion_3.png' },
                { key: 'bad_money', frame: 'bad_exposion_4.png' },
                { key: 'bad_money', frame: 'bad_exposion_5.png' },
                { key: 'bad_money', frame: 'bad_exposion_6.png' },
                { key: 'bad_money', frame: 'bad_exposion_7.png' },
                { key: 'bad_money', frame: 'bad_exposion_8.png' },
                { key: 'bad_money', frame: 'bad_exposion_9.png' }
            ],
            frameRate: 14,
            repeat: 0,
            hideOnComplete: true
        });
        
        // Создаем анимацию для хороших блоков с использованием новых кадров
        scene.anims.create({
            key: 'good_explode',
            frames: [
                { key: 'good_super', frame: 'good_explosion_1.png' },
                { key: 'good_super', frame: 'good_explosion_2.png' },
                { key: 'good_super', frame: 'good_explosion_3.png' },
                { key: 'good_super', frame: 'good_explosion_4.png' },
                { key: 'good_super', frame: 'good_explosion_5.png' },
                { key: 'good_super', frame: 'good_explosion_6.png' }
            ],
            frameRate: 12,
            repeat: 0,
            hideOnComplete: true
        });
        
        // Создаем анимацию для супер блоков с использованием новых кадров
        scene.anims.create({
            key: 'super_explode',
            frames: [
                { key: 'good_super', frame: 'super_explosion_1.png' },
                { key: 'good_super', frame: 'super_explosion_2.png' },
                { key: 'good_super', frame: 'super_explosion_3.png' },
                { key: 'good_super', frame: 'super_explosion_4.png' },
                { key: 'good_super', frame: 'super_explosion_5.png' },
                { key: 'good_super', frame: 'super_explosion_6.png' },
                { key: 'good_super', frame: 'super_explosion_7.png' },
                { key: 'good_super', frame: 'super_explosion_8.png' }
            ],
            frameRate: 14,
            repeat: 0,
            hideOnComplete: true
        });
        
        // Создаем анимацию для денежных блоков (трейдер)
        scene.anims.create({
            key: 'money_explode',
            frames: [
                { key: 'bad_money', frame: 'money_exposion_1.png' },
                { key: 'bad_money', frame: 'money_exposion_2.png' },
                { key: 'bad_money', frame: 'money_exposion_3.png' },
                { key: 'bad_money', frame: 'money_exposion_4.png' },
                { key: 'bad_money', frame: 'money_exposion_5.png' },
                { key: 'bad_money', frame: 'money_exposion_6.png' },
                { key: 'bad_money', frame: 'money_exposion_7.png' },
                { key: 'bad_money', frame: 'money_exposion_8.png' }
            ],
            frameRate: 12,
            repeat: 0,
            hideOnComplete: true
        });
        
        console.log('Анимации взрывов успешно созданы');
        return true;
    } catch (error) {
        console.error('Ошибка при создании анимаций взрывов:', error);
        console.error(error.stack);
        return false;
    }
}

/**
 * Настройки для загрузки спрайтшита взрыва (устаревшая функция)
 * @returns {Object} - Объект с настройками
 * @deprecated Используйте атлас текстур вместо спрайтшита
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