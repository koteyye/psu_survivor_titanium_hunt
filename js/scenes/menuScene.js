// Сцена главного меню
export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Загружаем ресурсы для меню
        this.load.image('background', 'assets/background.jpeg');
        
        // Если нужны дополнительные ресурсы для меню, их можно загрузить здесь
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);
        
        // Добавляем заголовок игры
        this.add.text(400, 100, 'PSU Survivor: Titanium Hunt', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Создаем кнопки меню
        this.createButton(400, 250, 'Начать игру', () => {
            this.scene.start('MainScene');
        });
        
        this.createButton(400, 330, 'Настройки', () => {
            this.scene.start('SettingsScene');
        });
        
        this.createButton(400, 410, 'Об игре', () => {
            this.scene.start('AboutScene');
        });
    }
    
    // Вспомогательная функция для создания кнопок
    createButton(x, y, text, callback) {
        // Создаем прямоугольник для кнопки
        const button = this.add.rectangle(x, y, 300, 60, 0x4a6fa5, 0.8);
        button.setStrokeStyle(2, 0xffffff);
        
        // Добавляем текст на кнопку
        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Делаем кнопку интерактивной
        button.setInteractive();
        
        // Добавляем эффекты при наведении и клике
        button.on('pointerover', () => {
            button.fillColor = 0x5a8ac5;
            buttonText.setStyle({ fill: '#ffffff' });
        });
        
        button.on('pointerout', () => {
            button.fillColor = 0x4a6fa5;
            buttonText.setStyle({ fill: '#ffffff' });
        });
        
        button.on('pointerdown', () => {
            button.fillColor = 0x3a5f95;
            buttonText.setStyle({ fill: '#cccccc' });
        });
        
        button.on('pointerup', () => {
            button.fillColor = 0x5a8ac5;
            buttonText.setStyle({ fill: '#ffffff' });
            callback();
        });
        
        return { button, text: buttonText };
    }
}
