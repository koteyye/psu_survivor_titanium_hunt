// Менеджер плавающих текстов с использованием Object Pool
import { BaseUIElement } from './base_ui_element.js';
import { ObjectPoolManager } from '../../../../managers/object_pool_manager.js';

export class FloatingTextManager extends BaseUIElement {
    constructor(scene, character) {
        super(scene, character);
        this.objectPoolManager = ObjectPoolManager.getInstance();
        
        // Инициализируем пул объектов
        this.initObjectPool();
    }
    
    // Инициализация пула объектов для плавающих текстов
    initObjectPool() {
        try {
            // Пул для плавающих текстов
            if (!this.objectPoolManager.getPool('floatingTexts')) {
                // Проверяем наличие конфигурации
                const defaultConfig = {
                    fontSize: "24px",
                    strokeThickness: 3,
                    strokeColor: "#000000",
                    initialSize: 20
                };
                
                // Используем конфигурацию из uiConfig, если она доступна, иначе используем значения по умолчанию
                const textConfig = this.uiConfig && this.uiConfig.floatingText && this.uiConfig.floatingText.pool
                    ? this.uiConfig.floatingText.pool
                    : defaultConfig;
                
                this.objectPoolManager.createPool(
                    'floatingTexts',
                    this.scene,
                    'blank', // Используем пустую текстуру
                    (obj, config = {}) => {
                        try {
                            // Проверяем, является ли объект текстом
                            if (!obj.setText) {
                                // Если объект не имеет метода setText, создаем новый текстовый объект
                                const newText = this.scene.add.text(0, 0, '', {
                                    fontSize: textConfig.fontSize,
                                    fill: '#ffffff',
                                    stroke: textConfig.strokeColor,
                                    strokeThickness: textConfig.strokeThickness
                                });
                                
                                // Сохраняем ссылку на текстовый объект
                                obj.textObject = newText;
                            }
                            
                            // Получаем текстовый объект
                            const textObj = obj.textObject || obj;
                            
                            // Настраиваем текст
                            if (textObj.setText) {
                                textObj.setText(config.text || '');
                            }
                            
                            if (textObj.setFill) {
                                textObj.setFill(config.color || '#ffffff');
                            }
                            
                            if (textObj.setPosition) {
                                textObj.setPosition(config.x || 0, config.y || 0);
                            }
                            
                            if (textObj.setOrigin) {
                                textObj.setOrigin(
                                    config.originX !== undefined ? config.originX : 0.5,
                                    config.originY !== undefined ? config.originY : 0.5
                                );
                            }
                            
                            if (textObj.setAlpha) {
                                textObj.setAlpha(1);
                            }
                            
                            if (textObj.setScale) {
                                textObj.setScale(1);
                            }
                        } catch (error) {
                            console.error('Ошибка при настройке текстового объекта:', error);
                        }
                    },
                    textConfig.initialSize || 20
                );
            }
        } catch (error) {
            console.error('Ошибка при инициализации пула плавающих текстов:', error);
        }
    }
    
    // Создание текста с эффектом исчезновения
    createFloatingText(text, color = '#ff0000', duration = 1500, yOffset = -100, animationType = 'default') {
        try {
            // Проверяем наличие пула
            if (!this.objectPoolManager.getPool('floatingTexts')) {
                // Если пул не создан, пробуем создать его
                this.initObjectPool();
                
                // Если пул все еще не создан, выходим
                if (!this.objectPoolManager.getPool('floatingTexts')) {
                    console.error('Не удалось создать пул floatingTexts');
                    return null;
                }
            }
            
            // Значения по умолчанию для анимации
            const defaultAnimConfig = {
                duration: duration,
                yOffset: yOffset,
                ease: 'Power2',
                alpha: 0
            };
            
            // Значения по умолчанию для позиции
            const defaultPosConfig = {
                offsetY: -50,
                originX: 0.5,
                originY: 0.5
            };
            
            // Используем конфигурацию из uiConfig, если она доступна, иначе используем значения по умолчанию
            let animConfig = defaultAnimConfig;
            let posConfig = defaultPosConfig;
            
            if (this.uiConfig && this.uiConfig.floatingText) {
                if (this.uiConfig.floatingText.animations) {
                    animConfig = this.uiConfig.floatingText.animations[animationType] ||
                                this.uiConfig.floatingText.animations.default ||
                                defaultAnimConfig;
                }
                
                if (this.uiConfig.floatingText.positions) {
                    posConfig = this.uiConfig.floatingText.positions || defaultPosConfig;
                }
            }
            
            // Получаем объект из пула
            const poolObject = this.objectPoolManager.get('floatingTexts',
                this.character.sprite.x,
                this.character.sprite.y + (posConfig.offsetY || -50),
                {
                    text: text,
                    color: color,
                    originX: posConfig.originX || 0.5,
                    originY: posConfig.originY || 0.5
                }
            );
            
            if (!poolObject) {
                console.warn('Не удалось получить объект из пула floatingTexts');
                return null;
            }
            
            // Определяем, какой объект использовать для анимации
            // Если у объекта есть свойство textObject, используем его
            const floatingText = poolObject.textObject || poolObject;
            
            // Анимация исчезновения текста
            const tweenConfig = {
                targets: floatingText,
                y: floatingText.y + (animConfig.yOffset || yOffset),
                alpha: animConfig.alpha || 0,
                duration: animConfig.duration || duration,
                ease: animConfig.ease || 'Power2',
                onComplete: () => {
                    this.objectPoolManager.release('floatingTexts', poolObject);
                }
            };
            
            // Добавляем масштабирование, если оно указано в конфиге
            if (animConfig.scale) {
                tweenConfig.scale = animConfig.scale;
            }
            
            this.scene.tweens.add(tweenConfig);
            
            return floatingText;
        } catch (error) {
            console.error('Ошибка при создании плавающего текста:', error);
            return null;
        }
    }
    
    // Очистка ресурсов
    destroy() {
        try {
            // Очищаем пул плавающих текстов
            const pool = this.objectPoolManager && this.objectPoolManager.getPool('floatingTexts');
            if (pool) {
                // Уничтожаем текстовые объекты, если они есть
                pool.getChildren().forEach(obj => {
                    if (obj.textObject && obj.textObject.destroy) {
                        obj.textObject.destroy();
                        obj.textObject = null;
                    }
                });
                
                this.objectPoolManager.clearPool('floatingTexts');
            }
        } catch (error) {
            console.error('Ошибка при очистке пула плавающих текстов:', error);
        }
    }
}

export default FloatingTextManager;