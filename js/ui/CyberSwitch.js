import { CyberUIElement } from './CyberUIElement.js';

// Класс для создания переключателей в киберпанк-стиле
export class CyberSwitch extends CyberUIElement {
    /**
     * Создает переключатель в киберпанк-стиле
     * @param {Phaser.Scene} scene - Сцена, в которой создается переключатель
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} text - Текст переключателя
     * @param {boolean} initialState - Начальное состояние переключателя
     * @param {function} callback - Функция, вызываемая при изменении состояния
     * @param {object} options - Дополнительные опции
     */
    constructor(scene, x, y, text, initialState, callback, options = {}) {
        super(scene, x, y, options);
        
        // Настройки по умолчанию
        this.width = options.width || 400;
        this.height = options.height || 60;
        this.fontSize = options.fontSize || 24;
        this.iconKey = options.iconKey || null; // Ключ текстуры для иконки
        this.callback = callback;
        this.state = initialState;
        
        // Создаем элементы переключателя
        this.createSwitch(text);
    }
    
    /**
     * Создает элементы переключателя
     * @param {string} text - Текст переключателя
     */
    createSwitch(text) {
        // Создаем контейнер
        this.container = this.scene.add.container(this.x, this.y);
        
        // Создаем фон (опционально)
        if (this.options.showBackground) {
            this.background = this.scene.add.rectangle(
                0, 
                0, 
                this.width, 
                this.height, 
                this.colors.bgGlow, 
                0.05
            );
            this.background.setStrokeStyle(3, this.colors.accent, 0.3); // Увеличиваем толщину обводки для эффекта скругления
            this.container.add(this.background);
        }
        
        // Создаем текст
        if (text) {
            this.textObject = this.scene.add.text(
                -this.width / 2 + 40 + (this.iconKey ? 40 : 0), 
                0, 
                text, 
                {
                    fontFamily: 'Orbitron',
                    fontSize: `${this.fontSize}px`,
                    color: `#${this.colors.accent.toString(16).padStart(6, '0')}`,
                    align: 'left'
                }
            );
            this.textObject.setOrigin(0, 0.5);
            this.container.add(this.textObject);
        }
        
        // Создаем иконку, если указан ключ текстуры
        if (this.iconKey) {
            this.icon = this.scene.add.image(-this.width / 2 + 20, 0, this.iconKey);
            this.icon.setDisplaySize(32, 32);
            this.container.add(this.icon);
            
            // Добавляем свечение для иконки
            this.iconGlow = this.scene.add.image(-this.width / 2 + 20, 0, this.iconKey);
            this.iconGlow.setDisplaySize(40, 40); // Увеличиваем размер свечения
            this.iconGlow.setTint(this.colors.accent);
            this.iconGlow.setAlpha(0.3); // Уменьшаем начальную яркость
            this.iconGlow.setBlendMode(Phaser.BlendModes.ADD);
            this.container.add(this.iconGlow);
            
            // Добавляем пульсацию для свечения иконки с меньшей интенсивностью
            this.scene.tweens.add({
                targets: this.iconGlow,
                alpha: { from: 0.2, to: 0.4 }, // Уменьшаем диапазон пульсации
                duration: 1500, // Увеличиваем длительность для более плавной пульсации
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Создаем переключатель с более толстой обводкой для эффекта скругления
        this.track = this.scene.add.rectangle(
            this.width / 2 - 50, 
            0, 
            50, 
            28, 
            this.colors.bgGlow, 
            0.1
        );
        this.track.setStrokeStyle(3, this.colors.accent); // Увеличиваем толщину обводки
        this.container.add(this.track);
        
        // Создаем индикатор (кружок)
        this.indicator = this.scene.add.circle(
            this.width / 2 - 50 + (this.state ? 22 : -22), 
            0, 
            12, 
            this.colors.accent
        );
        this.container.add(this.indicator);
        
        // Создаем эффект свечения для индикатора (увеличиваем размер)
        this.indicatorGlow = this.scene.add.circle(
            this.width / 2 - 50 + (this.state ? 22 : -22), 
            0, 
            18, // Увеличиваем размер свечения
            this.colors.accent, 
            0.3 // Уменьшаем начальную яркость
        );
        this.indicatorGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.container.add(this.indicatorGlow);
        
        // Делаем переключатель интерактивным
        this.track.setInteractive({ useHandCursor: true });
        this.indicator.setInteractive({ useHandCursor: true });
        
        // Добавляем обработчики событий
        this.setupEventHandlers();
        
        // Добавляем элементы в массив
        this.elements.push(this.container);
    }
    
    /**
     * Настраивает обработчики событий для переключателя
     */
    setupEventHandlers() {
        // Функция для обработки клика
        const handleClick = () => {
            this.setState(!this.state);
            
            // Вызываем callback
            if (this.callback) {
                this.callback(this.state);
            }
        };
        
        // Наведение курсора
        this.track.on('pointerover', () => {
            this.track.fillAlpha = 0.2;
            // Усиливаем свечение при наведении (но не слишком сильно)
            this.indicatorGlow.setAlpha(0.5);
            this.indicatorGlow.setScale(1.2);
        });
        
        this.indicator.on('pointerover', () => {
            this.track.fillAlpha = 0.2;
            // Усиливаем свечение при наведении (но не слишком сильно)
            this.indicatorGlow.setAlpha(0.5);
            this.indicatorGlow.setScale(1.2);
        });
        
        // Уход курсора
        this.track.on('pointerout', () => {
            this.track.fillAlpha = 0.1;
            // Возвращаем обычное свечение
            this.indicatorGlow.setAlpha(0.3);
            this.indicatorGlow.setScale(1.0);
        });
        
        this.indicator.on('pointerout', () => {
            this.track.fillAlpha = 0.1;
            // Возвращаем обычное свечение
            this.indicatorGlow.setAlpha(0.3);
            this.indicatorGlow.setScale(1.0);
        });
        
        // Клик
        this.track.on('pointerdown', handleClick);
        this.indicator.on('pointerdown', handleClick);
    }
    
    /**
     * Устанавливает состояние переключателя
     * @param {boolean} state - Новое состояние
     */
    setState(state) {
        this.state = state;
        
        // Анимируем перемещение индикатора
        this.scene.tweens.add({
            targets: [this.indicator, this.indicatorGlow],
            x: this.width / 2 - 50 + (state ? 22 : -22),
            duration: 200,
            ease: 'Power2'
        });
        
        // Меняем цвет трека
        if (state) {
            this.track.fillAlpha = 0.2;
        } else {
            this.track.fillAlpha = 0.1;
        }
        
        return this;
    }
    
    /**
     * Возвращает текущее состояние переключателя
     * @returns {boolean} Состояние переключателя
     */
    getState() {
        return this.state;
    }
    
    /**
     * Устанавливает текст переключателя
     * @param {string} text - Новый текст
     */
    setText(text) {
        if (this.textObject) {
            this.textObject.setText(text);
        }
        return this;
    }
}