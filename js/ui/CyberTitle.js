import { CyberUIElement } from './CyberUIElement.js';

// Класс для создания заголовков в неоновом стиле
export class CyberTitle extends CyberUIElement {
    /**
     * Создает заголовок в неоновом стиле
     * @param {Phaser.Scene} scene - Сцена, в которой создается заголовок
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} text - Текст заголовка
     * @param {object} options - Дополнительные опции
     */
    constructor(scene, x, y, text, options = {}) {
        super(scene, x, y, options);
        
        // Настройки по умолчанию
        this.fontSize = options.fontSize || 64;
        this.color = options.color || this.colors.accent;
        this.pulseAnimation = options.pulseAnimation !== false;
        this.glowIntensity = options.glowIntensity || 1;
        this.uppercase = options.uppercase !== false;
        
        // Создаем элементы заголовка
        this.createTitle(text);
    }
    
    /**
     * Создает элементы заголовка
     * @param {string} text - Текст заголовка
     */
    createTitle(text) {
        // Преобразуем текст в верхний регистр, если нужно
        const displayText = this.uppercase ? text.toUpperCase() : text;
        
        // Создаем слои свечения (для эффекта неона)
        this.glow2 = this.scene.add.text(
            this.x, 
            this.y, 
            displayText, 
            {
                fontFamily: 'Orbitron',
                fontSize: `${this.fontSize}px`,
                color: `#${this.color.toString(16).padStart(6, '0')}`,
                align: 'center',
                stroke: `#${this.colors.accentDark.toString(16).padStart(6, '0')}`,
                strokeThickness: 10 * this.glowIntensity
            }
        );
        this.glow2.setOrigin(0.5);
        this.glow2.setAlpha(0.4);
        
        this.glow1 = this.scene.add.text(
            this.x, 
            this.y, 
            displayText, 
            {
                fontFamily: 'Orbitron',
                fontSize: `${this.fontSize}px`,
                color: `#${this.color.toString(16).padStart(6, '0')}`,
                align: 'center',
                stroke: `#${this.color.toString(16).padStart(6, '0')}`,
                strokeThickness: 4 * this.glowIntensity
            }
        );
        this.glow1.setOrigin(0.5);
        this.glow1.setAlpha(0.7);
        
        // Создаем основной текст
        this.textObject = this.scene.add.text(
            this.x, 
            this.y, 
            displayText, 
            {
                fontFamily: 'Orbitron',
                fontSize: `${this.fontSize}px`,
                color: '#ffffff',
                align: 'center'
            }
        );
        this.textObject.setOrigin(0.5);
        
        // Добавляем пульсацию, если она включена
        if (this.pulseAnimation) {
            this.createPulseEffect(this.glow2, 0.2, 0.4);
            this.createPulseEffect(this.glow1, 0.5, 0.7);
        }
        
        // Добавляем элементы в массив
        this.elements.push(this.glow2, this.glow1, this.textObject);
    }
    
    /**
     * Устанавливает текст заголовка
     * @param {string} text - Новый текст
     */
    setText(text) {
        // Преобразуем текст в верхний регистр, если нужно
        const displayText = this.uppercase ? text.toUpperCase() : text;
        
        this.textObject.setText(displayText);
        this.glow1.setText(displayText);
        this.glow2.setText(displayText);
        
        return this;
    }
    
    /**
     * Устанавливает цвет заголовка
     * @param {number} color - Новый цвет
     */
    setColor(color) {
        this.color = color;
        
        this.glow1.setStyle({
            stroke: `#${color.toString(16).padStart(6, '0')}`,
            color: `#${color.toString(16).padStart(6, '0')}`
        });
        
        this.glow2.setStyle({
            color: `#${color.toString(16).padStart(6, '0')}`
        });
        
        return this;
    }
    
    /**
     * Устанавливает интенсивность свечения
     * @param {number} intensity - Интенсивность свечения
     */
    setGlowIntensity(intensity) {
        this.glowIntensity = intensity;
        
        this.glow1.setStyle({
            strokeThickness: 4 * intensity
        });
        
        this.glow2.setStyle({
            strokeThickness: 10 * intensity
        });
        
        return this;
    }
    
    /**
     * Создает эффект мерцания для заголовка
     * @param {number} minAlpha - Минимальная прозрачность
     * @param {number} maxAlpha - Максимальная прозрачность
     * @param {number} duration - Длительность одного цикла в мс
     */
    createFlickerEffect(minAlpha = 0.7, maxAlpha = 1, duration = 100) {
        // Останавливаем предыдущую анимацию пульсации, если она есть
        if (this.pulseTween) {
            this.scene.tweens.remove(this.pulseTween);
        }
        
        // Создаем случайное мерцание (как у неоновых вывесок)
        const flicker = () => {
            const randomDuration = Phaser.Math.Between(50, 200);
            const randomAlpha = Phaser.Math.FloatBetween(minAlpha, maxAlpha);
            
            this.pulseTween = this.scene.tweens.add({
                targets: [this.glow1, this.glow2],
                alpha: randomAlpha,
                duration: randomDuration,
                onComplete: flicker
            });
        };
        
        flicker();
        
        return this;
    }
}