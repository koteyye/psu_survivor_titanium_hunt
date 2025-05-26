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
        // Создаем фон кнопки
        this.background = this.scene.add.rectangle(
            this.x, 
            this.y, 
            this.width, 
            this.height, 
            this.colors.bgGlow, 
            this.colors.bgGlowAlpha
        );
        this.background.setStrokeStyle(3, this.colors.accent); // Увеличиваем толщину обводки для эффекта скругления
        this.background.setInteractive({ useHandCursor: true });
        
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
        
        // Создаем эффект свечения (увеличиваем размер)
        this.glow = this.scene.add.rectangle(
            this.x, 
            this.y, 
            this.width + 20, // Увеличиваем размер свечения
            this.height + 20, // Увеличиваем размер свечения
            this.colors.accent, 
            0.3 // Уменьшаем начальную яркость
        );
        this.glow.setBlendMode(Phaser.BlendModes.ADD);
        
        // Добавляем эффект пульсации с меньшей интенсивностью
        if (this.pulseAnimation) {
            this.scene.tweens.add({
                targets: this.glow,
                alpha: { from: 0.2, to: 0.4 }, // Уменьшаем диапазон пульсации
                duration: 1500, // Увеличиваем длительность для более плавной пульсации
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Добавляем обработчики событий
        this.setupEventHandlers();
        
        // Добавляем элементы в массив
        this.elements.push(this.background, this.textObject, this.glow);
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
                    this.background.fillAlpha = 0.2;
                    this.textObject.setStyle({ color: '#ffffff' });
                    
                    // Усиливаем свечение при наведении (но не слишком сильно)
                    this.glow.setAlpha(0.5);
                    this.glow.setScale(1.1);
                }
            });
            
            // Уход курсора
            this.background.on('pointerout', () => {
                if (!this.disabled) {
                    this.background.fillColor = this.colors.bgGlow;
                    this.background.fillAlpha = this.colors.bgGlowAlpha;
                    this.textObject.setStyle({ 
                        color: `#${this.colors.accent.toString(16).padStart(6, '0')}`
                    });
                    
                    // Возвращаем обычное свечение
                    this.glow.setAlpha(0.3);
                    this.glow.setScale(1.0);
                }
            });
            
            // Нажатие кнопки
            this.background.on('pointerdown', () => {
                if (!this.disabled) {
                    this.background.fillColor = this.colors.accent;
                    this.background.fillAlpha = 0.4;
                    this.textObject.setStyle({ color: '#cccccc' });
                    this.background.y += 2; // Небольшой эффект нажатия
                    this.textObject.y += 2;
                    this.glow.y += 2;
                }
            });
            
            // Отпускание кнопки
            this.background.on('pointerup', () => {
                if (!this.disabled) {
                    this.background.fillColor = this.colors.accent;
                    this.background.fillAlpha = 0.2;
                    this.textObject.setStyle({ color: '#ffffff' });
                    this.background.y -= 2; // Возвращаем на место
                    this.textObject.y -= 2;
                    this.glow.y -= 2;
                    
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