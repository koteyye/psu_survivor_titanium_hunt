import { CyberUIElement } from './CyberUIElement.js';

// Класс для создания карточек выбора персонажа в киберпанк-стиле
export class CyberCard extends CyberUIElement {
    /**
     * Создает карточку выбора персонажа в киберпанк-стиле
     * @param {Phaser.Scene} scene - Сцена, в которой создается карточка
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} imageKey - Ключ текстуры изображения
     * @param {function} callback - Функция, вызываемая при клике на карточку
     * @param {object} options - Дополнительные опции
     */
    constructor(scene, x, y, imageKey, callback, options = {}) {
        super(scene, x, y, options);
        
        // Настройки по умолчанию
        this.width = options.width || 200;
        this.height = options.height || 300;
        this.imageKey = imageKey;
        this.callback = callback;
        this.id = options.id || null;
        this.selected = options.selected || false;
        
        // Создаем элементы карточки
        this.createCard();
    }
    
    /**
     * Создает элементы карточки
     */
    createCard() {
        // Создаем контейнер
        this.container = this.scene.add.container(this.x, this.y);
        
        // Создаем фон карточки
        this.background = this.scene.add.rectangle(
            0, 
            0, 
            this.width, 
            this.height, 
            0x222222, 
            1
        );
        this.background.setStrokeStyle(2, this.selected ? this.colors.accent : 0x555555);
        this.container.add(this.background);
        
        // Создаем изображение
        this.image = this.scene.add.image(0, 0, this.imageKey);
        this.image.setDisplaySize(this.width - 10, this.height - 10);
        
        // Если карточка не выбрана, делаем изображение черно-белым
        if (!this.selected) {
            this.image.setTint(0xaaaaaa);
        }
        
        this.container.add(this.image);
        
        // Создаем эффект свечения для выбранной карточки
        this.glow = this.scene.add.rectangle(
            0, 
            0, 
            this.width + 10, 
            this.height + 10, 
            this.colors.accent, 
            0.3
        );
        this.glow.setVisible(this.selected);
        this.container.add(this.glow);
        
        // Делаем карточку интерактивной
        this.background.setInteractive({ useHandCursor: true });
        
        // Добавляем обработчики событий
        this.setupEventHandlers();
        
        // Добавляем элементы в массив
        this.elements.push(this.container);
    }
    
    /**
     * Настраивает обработчики событий для карточки
     */
    setupEventHandlers() {
        // Наведение курсора
        this.background.on('pointerover', () => {
            if (!this.selected) {
                this.background.setStrokeStyle(2, this.colors.accent);
                this.image.clearTint();
                this.glow.setVisible(true);
                this.glow.setAlpha(0.2);
            }
        });
        
        // Уход курсора
        this.background.on('pointerout', () => {
            if (!this.selected) {
                this.background.setStrokeStyle(2, 0x555555);
                this.image.setTint(0xaaaaaa);
                this.glow.setVisible(false);
            }
        });
        
        // Клик
        this.background.on('pointerdown', () => {
            // Вызываем callback
            if (this.callback) {
                this.callback(this);
            }
        });
    }
    
    /**
     * Устанавливает состояние выбора карточки
     * @param {boolean} selected - Выбрана ли карточка
     */
    setSelected(selected) {
        this.selected = selected;
        
        if (selected) {
            // Стиль для выбранной карточки
            this.background.setStrokeStyle(2, this.colors.accent);
            this.image.clearTint();
            this.glow.setVisible(true);
            this.glow.setAlpha(0.3);
            
            // Добавляем анимацию пульсации
            this.createPulseEffect(this.glow, 0.2, 0.4);
        } else {
            // Стиль для невыбранной карточки
            this.background.setStrokeStyle(2, 0x555555);
            this.image.setTint(0xaaaaaa);
            this.glow.setVisible(false);
            
            // Останавливаем анимацию пульсации
            this.scene.tweens.killTweensOf(this.glow);
        }
        
        return this;
    }
    
    /**
     * Возвращает ID карточки
     * @returns {any} ID карточки
     */
    getId() {
        return this.id;
    }
    
    /**
     * Устанавливает ID карточки
     * @param {any} id - Новый ID
     */
    setId(id) {
        this.id = id;
        return this;
    }
    
    /**
     * Устанавливает изображение карточки
     * @param {string} imageKey - Ключ текстуры изображения
     */
    setImage(imageKey) {
        this.imageKey = imageKey;
        this.image.setTexture(imageKey);
        return this;
    }
}