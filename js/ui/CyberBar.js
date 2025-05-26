import { CyberUIElement } from './CyberUIElement.js';

// Класс для создания шкал в киберпанк-стиле
export class CyberBar extends CyberUIElement {
    /**
     * Создает шкалу в киберпанк-стиле
     * @param {Phaser.Scene} scene - Сцена, в которой создается шкала
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {number} value - Начальное значение (0-100)
     * @param {object} options - Дополнительные опции
     */
    constructor(scene, x, y, value, options = {}) {
        super(scene, x, y, options);
        
        // Настройки по умолчанию
        this.width = options.width || 400;
        this.height = options.height || 30;
        this.iconKey = options.iconKey || null; // Ключ текстуры для иконки
        this.showValue = options.showValue !== false; // Показывать ли числовое значение
        this.barColor = options.barColor || this.colors.accent; // Цвет шкалы
        this.pulseAnimation = options.pulseAnimation !== false; // Анимация пульсации
        this.value = Phaser.Math.Clamp(value, 0, 100); // Значение от 0 до 100
        
        // Создаем элементы шкалы
        this.createBar();
    }
    
    /**
     * Создает элементы шкалы
     */
    createBar() {
        // Создаем контейнер
        this.container = this.scene.add.container(this.x, this.y);
        
        // Создаем иконку, если указан ключ текстуры
        if (this.iconKey) {
            this.icon = this.scene.add.image(-this.width / 2 - 50, 0, this.iconKey);
            this.icon.setDisplaySize(64, 64);
            this.container.add(this.icon);
            
            // Добавляем свечение для иконки
            const iconGlow = this.scene.add.image(-this.width / 2 - 50, 0, this.iconKey);
            iconGlow.setDisplaySize(70, 70);
            iconGlow.setTint(this.barColor);
            iconGlow.setAlpha(0.5);
            iconGlow.setBlendMode(Phaser.BlendModes.ADD);
            this.container.add(iconGlow);
            this.elements.push(iconGlow);
            
            // Добавляем пульсацию для свечения
            if (this.pulseAnimation) {
                this.createPulseEffect(iconGlow, 0.3, 0.5);
            }
        }
        
        // Создаем фон шкалы
        this.barBackground = this.scene.add.rectangle(
            0, 
            0, 
            this.width, 
            this.height, 
            this.colors.bgGlow, 
            0.1
        );
        this.barBackground.setStrokeStyle(2, this.barColor);
        this.container.add(this.barBackground);
        
        // Создаем заполнение шкалы (с фиксированной позицией слева)
        this.barFill = this.scene.add.rectangle(
            -this.width / 2, 
            0, 
            this.value / 100 * this.width, 
            this.height - 4, 
            this.barColor
        );
        this.barFill.setOrigin(0, 0.5); // Устанавливаем origin слева по центру
        this.container.add(this.barFill);
        
        // Создаем градиент для заполнения
        this.fillGradient = this.scene.add.rectangle(
            -this.width / 2, 
            0, 
            this.value / 100 * this.width, 
            this.height - 4, 
            0xffffff, 
            0.2
        );
        this.fillGradient.setOrigin(0, 0.5); // Устанавливаем origin слева по центру
        this.container.add(this.fillGradient);
        
        // Создаем текст со значением
        if (this.showValue) {
            this.valueText = this.scene.add.text(
                this.width / 2 + 20, 
                0, 
                `${Math.round(this.value)}%`, 
                {
                    fontFamily: 'Orbitron',
                    fontSize: '24px',
                    color: `#${this.barColor.toString(16).padStart(6, '0')}`,
                    align: 'left'
                }
            );
            this.valueText.setOrigin(0, 0.5);
            this.container.add(this.valueText);
        }
        
        // Создаем эффект свечения для шкалы
        this.barGlow = this.scene.add.rectangle(
            0, 
            0, 
            this.width + 10, 
            this.height + 10, 
            this.barColor, 
            0.2
        );
        this.barGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.container.add(this.barGlow);
        
        // Добавляем пульсацию для свечения
        if (this.pulseAnimation) {
            this.createPulseEffect(this.barGlow, 0.1, 0.2);
        }
        
        // Добавляем элементы в массив
        this.elements.push(this.container);
    }
    
    /**
     * Устанавливает значение шкалы
     * @param {number} value - Новое значение (0-100)
     * @param {boolean} animate - Анимировать изменение
     */
    setValue(value, animate = true) {
        // Ограничиваем значение от 0 до 100
        const newValue = Phaser.Math.Clamp(value, 0, 100);
        this.value = newValue;
        
        // Обновляем текст
        if (this.showValue && this.valueText) {
            this.valueText.setText(`${Math.round(newValue)}%`);
        }
        
        // Обновляем заполнение шкалы
        if (animate) {
            // С анимацией
            this.scene.tweens.add({
                targets: [this.barFill, this.fillGradient],
                width: newValue / 100 * this.width,
                duration: 300,
                ease: 'Power2'
            });
        } else {
            // Без анимации
            this.barFill.width = newValue / 100 * this.width;
            this.fillGradient.width = newValue / 100 * this.width;
        }
        
        return this;
    }
    
    /**
     * Возвращает текущее значение шкалы
     * @returns {number} Значение шкалы
     */
    getValue() {
        return this.value;
    }
    
    /**
     * Устанавливает цвет шкалы
     * @param {number} color - Новый цвет
     */
    setBarColor(color) {
        this.barColor = color;
        
        // Обновляем цвет элементов
        this.barBackground.setStrokeStyle(2, color);
        this.barFill.fillColor = color;
        this.barGlow.fillColor = color;
        
        if (this.showValue && this.valueText) {
            this.valueText.setStyle({ 
                color: `#${color.toString(16).padStart(6, '0')}`
            });
        }
        
        return this;
    }
}