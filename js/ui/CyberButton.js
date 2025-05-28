import { CyberUIElement } from './CyberUIElement.js';

// Класс для создания кнопок в киберпанк-стиле
export class CyberButton extends CyberUIElement {
    /**
     * Создает кнопку в киберпанк-стиле
     * @param {Phaser.Scene} scene - Сцена, в которой создается кнопка
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} text - Текст кнопки
     * @param {function} callback - Функция, вызываемая при клике на кнопку
     * @param {object} options - Дополнительные опции
     */
    constructor(scene, x, y, text, callback, options = {}) {
        super(scene, x, y, options);
        
        // Настройки по умолчанию
        this.width = options.width || 400;
        this.height = options.height || 80;
        this.fontSize = options.fontSize || 28;
        this.pulseAnimation = options.pulseAnimation !== false;
        this.disabled = options.disabled || false;
        this.callback = callback;
        
        // Создаем элементы кнопки
        this.createButton(text);
        
        // Если кнопка отключена, применяем соответствующий стиль
        if (this.disabled) {
            this.setDisabled(true);
        }
    }
    
    /**
     * Создает элементы кнопки
     * @param {string} text - Текст кнопки
     */
    createButton(text) {
        // Создаем фон кнопки (интерактивный прямоугольник)
        this.background = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            this.colors.bgGlow,
            this.colors.bgGlowAlpha
        );
        this.background.setStrokeStyle(2, this.colors.accent);
        this.background.setInteractive({ useHandCursor: true });
        
        // Создаем визуальный эффект закругленных углов
        this.buttonVisual = this.scene.add.graphics();
        this.buttonVisual.fillStyle(this.colors.bgGlow, this.colors.bgGlowAlpha);
        this.buttonVisual.lineStyle(2, this.colors.accent, 1);
        this.buttonVisual.fillRoundedRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            5 // Радиус скругления как в примере
        );
        this.buttonVisual.strokeRoundedRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            5 // Радиус скругления как в примере
        );
        
        // Создаем текст кнопки
        this.textObject = this.scene.add.text(
            this.x, 
            this.y, 
            text.toUpperCase(), 
            {
                fontFamily: 'Orbitron',
                fontSize: `${this.fontSize}px`,
                color: `#${this.colors.accent.toString(16).padStart(6, '0')}`,
                align: 'center'
            }
        );
        this.textObject.setOrigin(0.5);
        
        // Создаем несколько слоев свечения для имитации размытия
        
        // Самый внешний слой (очень прозрачный)
        this.outerGlow = this.scene.add.graphics();
        this.outerGlow.fillStyle(this.colors.accent, 0.05); // Уменьшаем прозрачность
        this.outerGlow.fillRoundedRect(
            this.x - (this.width + 80) / 2, // Увеличиваем размер для большего расстояния между кнопками
            this.y - (this.height + 80) / 2,
            this.width + 80,
            this.height + 80,
            25 // Больший радиус для внешнего слоя
        );
        this.outerGlow.setBlendMode(Phaser.BlendModes.ADD);
        
        // Средний слой
        this.middleGlow = this.scene.add.graphics();
        this.middleGlow.fillStyle(this.colors.accent, 0.08); // Уменьшаем прозрачность
        this.middleGlow.fillRoundedRect(
            this.x - (this.width + 60) / 2, // Увеличиваем размер
            this.y - (this.height + 60) / 2,
            this.width + 60,
            this.height + 60,
            20 // Средний радиус
        );
        this.middleGlow.setBlendMode(Phaser.BlendModes.ADD);
        
        // Основной слой свечения
        this.glow = this.scene.add.graphics();
        this.glow.fillStyle(this.colors.accent, 0.15); // Уменьшаем прозрачность
        this.glow.fillRoundedRect(
            this.x - (this.width + 40) / 2, // Увеличиваем размер
            this.y - (this.height + 40) / 2,
            this.width + 40,
            this.height + 40,
            15 // Радиус для основного слоя
        );
        this.glow.setBlendMode(Phaser.BlendModes.ADD);
        
        // Внутреннее свечение
        this.innerGlow = this.scene.add.graphics();
        this.innerGlow.fillStyle(this.colors.accent, 0.1); // Уменьшаем прозрачность
        this.innerGlow.fillRoundedRect(
            this.x - (this.width - 10) / 2,
            this.y - (this.height - 10) / 2,
            this.width - 10,
            this.height - 10,
            3 // Меньший радиус для внутреннего свечения
        );
        this.innerGlow.setBlendMode(Phaser.BlendModes.ADD);
        
        // Добавляем эффект пульсации для всех слоев свечения
        if (this.pulseAnimation) {
            this.scene.tweens.add({
                targets: [this.outerGlow, this.middleGlow, this.glow],
                alpha: { from: 0.3, to: 0.5 }, // Уменьшаем яркость пульсации
                duration: 1200, // Немного быстрее для более заметного эффекта
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.scene.tweens.add({
                targets: this.innerGlow,
                alpha: { from: 0.1, to: 0.2 }, // Уменьшаем яркость пульсации
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Добавляем обработчики событий
        this.setupEventHandlers();
        
        // Добавляем элементы в массив
        this.elements.push(this.background, this.buttonVisual, this.textObject, this.outerGlow, this.middleGlow, this.glow, this.innerGlow);
    }
    
    /**
     * Настраивает обработчики событий для кнопки
     */
    setupEventHandlers() {
        if (!this.disabled) {
            // Наведение курсора
            this.background.on('pointerover', () => {
                if (!this.disabled) {
                    this.background.fillColor = this.colors.accent;
                    this.background.fillAlpha = 0.3; // Увеличиваем прозрачность фона при наведении
                    
                    // Обновляем визуальный эффект
                    this.buttonVisual.clear();
                    this.buttonVisual.fillStyle(this.colors.accent, 0.3);
                    this.buttonVisual.lineStyle(2, this.colors.accent, 1);
                    this.buttonVisual.fillRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2,
                        this.width,
                        this.height,
                        5
                    );
                    this.buttonVisual.strokeRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2,
                        this.width,
                        this.height,
                        5
                    );
                    
                    this.textObject.setStyle({ color: '#0a0f1c' }); // Темный текст на светлом фоне как в примере
                    
                    // Усиливаем свечение при наведении для неонового эффекта, но не слишком ярко
                    this.outerGlow.setAlpha(0.15);
                    this.middleGlow.setAlpha(0.2);
                    this.glow.setAlpha(0.3);
                    this.innerGlow.setAlpha(0.2);
                }
            });
            
            // Уход курсора
            this.background.on('pointerout', () => {
                if (!this.disabled) {
                    this.background.fillColor = this.colors.bgGlow;
                    this.background.fillAlpha = this.colors.bgGlowAlpha;
                    
                    // Обновляем визуальный эффект
                    this.buttonVisual.clear();
                    this.buttonVisual.fillStyle(this.colors.bgGlow, this.colors.bgGlowAlpha);
                    this.buttonVisual.lineStyle(2, this.colors.accent, 1);
                    this.buttonVisual.fillRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2,
                        this.width,
                        this.height,
                        5
                    );
                    this.buttonVisual.strokeRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2,
                        this.width,
                        this.height,
                        5
                    );
                    
                    this.textObject.setStyle({
                        color: `#${this.colors.accent.toString(16).padStart(6, '0')}`
                    });
                    
                    // Возвращаем обычное свечение
                    this.outerGlow.setAlpha(0.05);
                    this.middleGlow.setAlpha(0.08);
                    this.glow.setAlpha(0.15);
                    this.innerGlow.setAlpha(0.1);
                }
            });
            
            // Нажатие кнопки
            this.background.on('pointerdown', () => {
                if (!this.disabled) {
                    this.background.fillColor = this.colors.accent;
                    this.background.fillAlpha = 0.5; // Увеличиваем прозрачность фона при нажатии
                    
                    // Обновляем визуальный эффект с эффектом нажатия
                    this.buttonVisual.clear();
                    this.buttonVisual.fillStyle(this.colors.accent, 0.5);
                    this.buttonVisual.lineStyle(2, this.colors.accent, 1);
                    this.buttonVisual.fillRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2 + 2, // Эффект нажатия
                        this.width,
                        this.height,
                        5
                    );
                    this.buttonVisual.strokeRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2 + 2, // Эффект нажатия
                        this.width,
                        this.height,
                        5
                    );
                    
                    this.textObject.setStyle({ color: '#0a0f1c' }); // Темный текст на светлом фоне
                    this.background.y += 2; // Небольшой эффект нажатия
                    this.buttonVisual.y += 2;
                    this.textObject.y += 2;
                    this.outerGlow.y += 2;
                    this.middleGlow.y += 2;
                    this.glow.y += 2;
                    this.innerGlow.y += 2;
                }
            });
            
            // Отпускание кнопки
            this.background.on('pointerup', () => {
                if (!this.disabled) {
                    this.background.fillColor = this.colors.accent;
                    this.background.fillAlpha = 0.3;
                    
                    // Обновляем визуальный эффект
                    this.buttonVisual.clear();
                    this.buttonVisual.fillStyle(this.colors.accent, 0.3);
                    this.buttonVisual.lineStyle(2, this.colors.accent, 1);
                    this.buttonVisual.fillRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2,
                        this.width,
                        this.height,
                        5
                    );
                    this.buttonVisual.strokeRoundedRect(
                        this.x - this.width / 2,
                        this.y - this.height / 2,
                        this.width,
                        this.height,
                        5
                    );
                    
                    this.textObject.setStyle({ color: '#0a0f1c' }); // Темный текст на светлом фоне
                    this.background.y -= 2; // Возвращаем на место
                    this.buttonVisual.y -= 2;
                    this.textObject.y -= 2;
                    this.outerGlow.y -= 2;
                    this.middleGlow.y -= 2;
                    this.glow.y -= 2;
                    this.innerGlow.y -= 2;
                    
                    // Вызываем callback
                    if (this.callback) {
                        this.callback();
                    }
                }
            });
        }
    }
    
    /**
     * Устанавливает текст кнопки
     * @param {string} text - Новый текст кнопки
     */
    setText(text) {
        this.textObject.setText(text.toUpperCase());
        return this;
    }
    
    /**
     * Устанавливает состояние отключения кнопки
     * @param {boolean} disabled - Отключена ли кнопка
     */
    setDisabled(disabled) {
        this.disabled = disabled;
        
        if (disabled) {
            // Стиль для отключенной кнопки
            this.background.setStrokeStyle(3, 0x555555);
            this.background.fillColor = 0x222222;
            this.background.fillAlpha = 1;
            this.textObject.setStyle({ color: '#777777' });
            
            // Отключаем свечение
            if (this.glow) {
                this.glow.setVisible(false);
            }
            if (this.innerGlow) {
                this.innerGlow.setVisible(false);
            }
            
            // Отключаем интерактивность
            this.background.disableInteractive();
        } else {
            // Возвращаем стандартный стиль
            this.background.setStrokeStyle(3, this.colors.accent);
            this.background.fillColor = this.colors.bgGlow;
            this.background.fillAlpha = this.colors.bgGlowAlpha;
            this.textObject.setStyle({ 
                color: `#${this.colors.accent.toString(16).padStart(6, '0')}`
            });
            
            // Включаем свечение
            if (this.glow) {
                this.glow.setVisible(true);
            }
            if (this.innerGlow) {
                this.innerGlow.setVisible(true);
            }
            
            // Включаем интерактивность
            this.background.setInteractive({ useHandCursor: true });
            
            // Настраиваем обработчики событий
            this.setupEventHandlers();
        }
        
        return this;
    }
    
    /**
     * Добавляет иконку к кнопке
     * @param {string} iconText - Текст иконки (например, эмодзи)
     */
    addIcon(iconText) {
        // Если уже есть иконка, удаляем ее
        if (this.icon) {
            this.icon.destroy();
            const index = this.elements.indexOf(this.icon);
            if (index > -1) {
                this.elements.splice(index, 1);
            }
        }
        
        // Создаем новую иконку
        this.icon = this.scene.add.text(
            this.x - this.width / 2 + 40, 
            this.y, 
            iconText, 
            {
                fontSize: `${this.fontSize}px`,
                color: `#${this.colors.accent.toString(16).padStart(6, '0')}`
            }
        );
        this.icon.setOrigin(0.5);
        
        // Смещаем текст вправо
        this.textObject.x += 20;
        
        // Добавляем иконку в массив элементов
        this.elements.push(this.icon);
        
        return this;
    }
}