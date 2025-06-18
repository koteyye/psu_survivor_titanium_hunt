// Менеджер эффектов с использованием Object Pool
import { BaseUIElement } from './base_ui_element.js';
import { ObjectPoolManager } from '../../../../managers/object_pool_manager.js';

export class EffectsManager extends BaseUIElement {
    constructor(scene, character) {
        super(scene, character);
        this.objectPoolManager = ObjectPoolManager.getInstance();
        
        // Инициализируем пул объектов
        this.initObjectPool();
    }
    
    // Инициализация пула объектов для эффектов
    initObjectPool() {
        try {
            // Пул для эффектов
            if (!this.objectPoolManager.getPool('effectsPool')) {
                this.objectPoolManager.createPool(
                    'effectsPool',
                    this.scene,
                    'explosion', // Базовая текстура для эффектов
                    (obj, config = {}) => {
                        obj.setOrigin(config.originX || 0.5, config.originY || 0.5);
                        obj.setDisplaySize(config.width || 400, config.height || 400);
                        if (config.tint) {
                            obj.setTint(config.tint);
                        } else {
                            obj.clearTint();
                        }
                    },
                    this.uiConfig.effects.pool.initialSize || 10
                );
            }
        } catch (error) {
            console.error('Ошибка при инициализации пула эффектов:', error);
        }
    }
    
    // Создание эффекта взрыва
    createExplosionEffect(x, y, type = 'money') {
        const effectConfig = this.uiConfig.effects.explosion[type];
        
        // Получаем объект из пула
        const explosion = this.objectPoolManager.get('effectsPool', x, y, {
            width: effectConfig.size,
            height: effectConfig.size,
            originX: effectConfig.origin,
            originY: effectConfig.origin,
            tint: effectConfig.tint ? parseInt(effectConfig.tint, 16) : undefined
        });
        
        if (!explosion) {
            console.warn('Не удалось получить объект из пула effectsPool');
            return null;
        }
        
        // Запускаем анимацию взрыва
        try {
            explosion.play(effectConfig.animationKey);
        } catch (error) {
            console.error(`Ошибка при запуске анимации ${effectConfig.animationKey}:`, error);
        }
        
        // Добавляем обработчик завершения анимации
        explosion.once('animationcomplete', () => {
            if (explosion && explosion.active) {
                this.objectPoolManager.release('effectsPool', explosion);
            }
        });
        
        return explosion;
    }
    
    // Создание анимации для персонажа
    createCharacterAnimation(type = 'default') {
        const animConfig = this.uiConfig.animations.character[type];
        
        // Добавляем мигание персонажа
        this.scene.tweens.add({
            targets: this.character.sprite,
            alpha: animConfig.alpha,
            duration: animConfig.duration,
            yoyo: true,
            repeat: animConfig.repeat,
            onComplete: () => {
                this.character.sprite.alpha = 1;
                this.character.sprite.clearTint();
            }
        });
        
        // Добавляем тинт
        this.character.sprite.setTint(parseInt(animConfig.tint, 16));
    }
    
    // Очистка ресурсов
    destroy() {
        // Очищаем пул эффектов
        if (this.objectPoolManager.getPool('effectsPool')) {
            this.objectPoolManager.clearPool('effectsPool');
        }
    }
}

export default EffectsManager;