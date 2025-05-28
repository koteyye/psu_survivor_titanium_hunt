// Базовый класс для всех UI элементов в киберпанк-стиле
export class CyberUIElement {
    /**
     * Создает базовый UI элемент
     * @param {Phaser.Scene} scene - Сцена, в которой создается элемент
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {object} options - Дополнительные опции
     */
    constructor(scene, x, y, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.options = options;
        this.elements = []; // Массив для хранения всех графических элементов
        this.isVisible = true;
        this.isActive = true;
        
        // Цвета из CSS переменных (обновлены для неонового стиля)
        this.colors = {
            accent: 0x00f7ff, // Более яркий неоновый цвет
            accentDark: 0x003344,
            textLight: 0xc0c0c0,
            bgGlow: 0x00f7ff, // Более яркий неоновый цвет
            bgGlowAlpha: 0.1
        };
    }
    
    /**
     * Устанавливает видимость элемента
     * @param {boolean} visible - Видимость элемента
     */
    setVisible(visible) {
        this.isVisible = visible;
        this.elements.forEach(element => {
            if (element && element.setVisible) {
                element.setVisible(visible);
            }
        });
        return this;
    }
    
    /**
     * Устанавливает активность элемента
     * @param {boolean} active - Активность элемента
     */
    setActive(active) {
        this.isActive = active;
        return this;
    }
    
    /**
     * Уничтожает элемент и все его компоненты
     */
    destroy() {
        this.elements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.elements = [];
    }
    
    /**
     * Создает эффект пульсации для элемента
     * @param {Phaser.GameObjects.GameObject} element - Элемент для пульсации
     * @param {number} minAlpha - Минимальная прозрачность
     * @param {number} maxAlpha - Максимальная прозрачность
     * @param {number} duration - Длительность одного цикла в мс
     */
    createPulseEffect(element, minAlpha = 0.7, maxAlpha = 1, duration = 1000) {
        this.scene.tweens.add({
            targets: element,
            alpha: { from: minAlpha, to: maxAlpha },
            duration: duration / 2,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        return element;
    }
    
    /**
     * Создает эффект свечения для элемента
     * @param {Phaser.GameObjects.GameObject} element - Элемент для свечения
     * @param {number} intensity - Интенсивность свечения
     */
    createGlowEffect(element, intensity = 1) {
        // Phaser не имеет встроенного эффекта свечения, поэтому мы создаем его с помощью дополнительных элементов
        const glow = this.scene.add.graphics();
        glow.fillStyle(this.colors.accent, 0.3 * intensity);
        
        if (element.width && element.height) {
            // Для прямоугольных элементов
            const padding = 10 * intensity;
            glow.fillRoundedRect(
                element.x - element.width / 2 - padding / 2,
                element.y - element.height / 2 - padding / 2,
                element.width + padding,
                element.height + padding,
                8
            );
        } else if (element.radius) {
            // Для круглых элементов
            const padding = 10 * intensity;
            glow.fillCircle(element.x, element.y, element.radius + padding);
        }
        
        this.elements.push(glow);
        glow.setDepth(element.depth - 1);
        return glow;
    }
}