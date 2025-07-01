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
        console.log('Создание анимаций взрывов...');
        console.log('Доступные текстуры:', Object.keys(scene.textures.list));
        
        // Проверяем доступность атласов
        const badMoneyAtlas = scene.textures.exists('bad_money');
        const goodSuperAtlas = scene.textures.exists('good_super');
        const explosionTexture = scene.textures.exists('explosion');
        
        console.log(`Атлас bad_money: ${badMoneyAtlas ? 'загружен' : 'НЕ НАЙДЕН'}`);
        console.log(`Атлас good_super: ${goodSuperAtlas ? 'загружен' : 'НЕ НАЙДЕН'}`);
        console.log(`Текстура explosion: ${explosionTexture ? 'загружена' : 'НЕ НАЙДЕНА'}`);
        
        // Если атласы не загружены, выводим детальную информацию
        if (badMoneyAtlas) {
            const badMoneyFrames = scene.textures.get('bad_money').getFrameNames();
            console.log('Кадры bad_money:', badMoneyFrames);
        }
        
        if (goodSuperAtlas) {
            const goodSuperFrames = scene.textures.get('good_super').getFrameNames();
            console.log('Кадры good_super:', goodSuperFrames);
        }
        
        // Удаляем существующие анимации, если они есть
        const animKeys = ['explode', 'good_explode', 'super_explode', 'money_explode', 'explosion_simple'];
        animKeys.forEach(key => {
            if (scene.anims.exists(key)) {
                scene.anims.remove(key);
            }
        });
        
        // Создаем простую анимацию для базового взрыва (используется в пуле взрывов)
        if (explosionTexture) {
            scene.anims.create({
                key: 'explosion_simple',
                frames: scene.anims.generateFrameNumbers('explosion', { start: 0, end: 0 }),
                frameRate: 1,
                repeat: 0,
                hideOnComplete: true
            });
            console.log('Анимация explosion_simple создана');
        } else {
            console.warn('Не удалось создать анимацию explosion_simple - текстура отсутствует');
        }
        
        // Создаем анимацию для плохих блоков с использованием новых кадров
        if (badMoneyAtlas) {
            scene.anims.create({
                key: 'explode',
                frames: [
                    { key: 'bad_money', frame: 'bad_exposion_5.png' },
                    { key: 'bad_money', frame: 'bad_exposion_7.png' },
                    { key: 'bad_money', frame: 'bad_exposion_8.png' },
                    { key: 'bad_money', frame: 'bad_exposion_9.png' },
                    { key: 'bad_money', frame: 'bad_exposion_6.png' },
                    { key: 'bad_money', frame: 'bad_exposion_1.png' },
                    { key: 'bad_money', frame: 'bad_exposion_2.png' },
                    { key: 'bad_money', frame: 'bad_exposion_3.png' },
                    { key: 'bad_money', frame: 'bad_exposion_4.png' }
                ],
                frameRate: 14,
                repeat: 0,
                hideOnComplete: true
            });
            console.log('Анимация explode создана');
        } else {
            console.warn('Не удалось создать анимацию explode - атлас bad_money отсутствует');
        }
        
        // Создаем анимацию для хороших блоков с использованием новых кадров
        if (goodSuperAtlas) {
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
            console.log('Анимация good_explode создана');
            
            // Создаем анимацию для супер блоков с использованием правильных кадров
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
            console.log('Анимация super_explode создана');
        } else {
            console.warn('Не удалось создать анимации good_explode и super_explode - атлас good_super отсутствует');
        }
        
        // Создаем анимацию для денежных блоков (трейдер)
        if (badMoneyAtlas) {
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
            console.log('Анимация money_explode создана');
        } else {
            console.warn('Не удалось создать анимацию money_explode - атлас bad_money отсутствует');
        }
        
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