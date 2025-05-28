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
        
        // Создаем интерактивный трек (прямоугольник) - невидимый, только для интерактивности
        this.track = this.scene.add.rectangle(
            this.width / 2 - 50,
            0,
            50,
            28,
            this.colors.bgGlow,
            0 // Делаем полностью прозрачным
        );
        this.track.setInteractive({ useHandCursor: true });
        this.container.add(this.track);
        
        // Создаем визуальный эффект закругленных углов для трека
        this.trackVisual = this.scene.add.graphics();
        this.trackVisual.fillStyle(this.colors.bgGlow, 0.05);
        this.trackVisual.lineStyle(2, this.colors.accent, 1);
        this.trackVisual.fillRoundedRect(
            this.width / 2 - 50 - 25, // центр - половина ширины
            -14, // половина высоты
            50,
            28,
            14 // Радиус скругления (половина высоты для эффекта капсулы)
        );
        this.trackVisual.strokeRoundedRect(
            this.width / 2 - 50 - 25, // центр - половина ширины
            -14, // половина высоты
            50,
            28,
            14 // Радиус скругления (половина высоты для эффекта капсулы)
        );
        this.container.add(this.trackVisual);
        
        // Создаем внешнее свечение для трека
        this.trackGlow = this.scene.add.graphics();
        this.trackGlow.fillStyle(this.colors.accent, 0.05);
        this.trackGlow.fillRoundedRect(
            this.width / 2 - 50 - 25 - 5, // немного шире
            -14 - 5, // немного выше
            50 + 10,
            28 + 10,
            19 // Больший радиус для свечения
        );
        this.trackGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.container.add(this.trackGlow);
        
        // Создаем индикатор (кружок) - интерактивный
        this.indicator = this.scene.add.circle(
            this.width / 2 - 50 + (this.state ? 15 : -15), // Корректируем позицию, чтобы индикатор был внутри трека
            0,
            10, // Немного меньше размер
            this.colors.accent
        );
        this.indicator.setInteractive({ useHandCursor: true });
        this.container.add(this.indicator);
        
        // Создаем многослойное свечение для индикатора
        // Внешний слой (самый прозрачный)
        this.indicatorOuterGlow = this.scene.add.circle(
            this.width / 2 - 50 + (this.state ? 15 : -15), // Корректируем позицию
            0,
            18, // Немного уменьшаем размер свечения
            this.colors.accent,
            0.05
        );
        this.indicatorOuterGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.container.add(this.indicatorOuterGlow);
        
        // Средний слой
        this.indicatorMiddleGlow = this.scene.add.circle(
            this.width / 2 - 50 + (this.state ? 15 : -15), // Корректируем позицию
            0,
            14,
            this.colors.accent,
            0.1
        );
        this.indicatorMiddleGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.container.add(this.indicatorMiddleGlow);
        
        // Внутренний слой (основное свечение)
        this.indicatorGlow = this.scene.add.circle(
            this.width / 2 - 50 + (this.state ? 15 : -15), // Корректируем позицию
            0,
            12,
            this.colors.accent,
            0.15
        );
        this.indicatorGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.container.add(this.indicatorGlow);
        
        // Добавляем пульсацию для свечения
        this.scene.tweens.add({
            targets: [this.indicatorOuterGlow, this.indicatorMiddleGlow, this.indicatorGlow],
            alpha: { from: 0.3, to: 0.5 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Добавляем обработчики событий
        this.setupEventHandlers();
        
        // Добавляем элементы в массив
        this.elements.push(this.container);
        
        // Если свитчер включен, меняем цвет трека
        if (this.state) {
            this.updateTrackColor(true);
        }
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
            // Усиливаем свечение при наведении
            this.updateTrackColor(this.state, true);
            this.indicatorOuterGlow.setAlpha(0.1);
            this.indicatorMiddleGlow.setAlpha(0.15);
            this.indicatorGlow.setAlpha(0.25);
        });
        
        this.indicator.on('pointerover', () => {
            // Усиливаем свечение при наведении
            this.updateTrackColor(this.state, true);
            this.indicatorOuterGlow.setAlpha(0.1);
            this.indicatorMiddleGlow.setAlpha(0.15);
            this.indicatorGlow.setAlpha(0.25);
        });
        
        // Уход курсора
        this.track.on('pointerout', () => {
            // Возвращаем обычное свечение
            this.updateTrackColor(this.state, false);
            this.indicatorOuterGlow.setAlpha(0.05);
            this.indicatorMiddleGlow.setAlpha(0.1);
            this.indicatorGlow.setAlpha(0.15);
        });
        
        this.indicator.on('pointerout', () => {
            // Возвращаем обычное свечение
            this.updateTrackColor(this.state, false);
            this.indicatorOuterGlow.setAlpha(0.05);
            this.indicatorMiddleGlow.setAlpha(0.1);
            this.indicatorGlow.setAlpha(0.15);
        });
        
        // Клик
        this.track.on('pointerdown', handleClick);
        this.indicator.on('pointerdown', handleClick);
    }
    
    /**
     * Устанавливает состояние переключателя
     * @param {boolean} state - Новое состояние
     */
    /**
     * Обновляет цвет трека в зависимости от состояния
     * @param {boolean} state - Состояние переключателя
     * @param {boolean} isHover - Находится ли курсор над переключателем
     */
    updateTrackColor(state, isHover = false) {
        // Трек остается невидимым, обновляем только визуальный эффект
        
        // Обновляем визуальный эффект трека
        this.trackVisual.clear();
        if (state) {
            this.trackVisual.fillStyle(this.colors.accent, isHover ? 0.15 : 0.1);
        } else {
            this.trackVisual.fillStyle(this.colors.bgGlow, isHover ? 0.1 : 0.05);
        }
        
        this.trackVisual.lineStyle(2, this.colors.accent, 1);
        this.trackVisual.fillRoundedRect(
            this.width / 2 - 50 - 25,
            -14,
            50,
            28,
            14
        );
        this.trackVisual.strokeRoundedRect(
            this.width / 2 - 50 - 25,
            -14,
            50,
            28,
            14
        );
        
        // Обновляем свечение трека
        this.trackGlow.clear();
        this.trackGlow.fillStyle(this.colors.accent, state ? (isHover ? 0.1 : 0.05) : 0.02);
        this.trackGlow.fillRoundedRect(
            this.width / 2 - 50 - 25 - 5,
            -14 - 5,
            50 + 10,
            28 + 10,
            19
        );
    }
    
    setState(state) {
        this.state = state;
        
        // Анимируем перемещение индикатора и всех его свечений
        this.scene.tweens.add({
            targets: [this.indicator, this.indicatorOuterGlow, this.indicatorMiddleGlow, this.indicatorGlow],
            x: this.width / 2 - 50 + (state ? 20 : -20), // Перемещаем индикатор в зависимости от состояния
            duration: 200,
            ease: 'Power2'
        });
        
        // Обновляем цвет трека
        this.updateTrackColor(state);
        
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