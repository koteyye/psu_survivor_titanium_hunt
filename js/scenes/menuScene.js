// Сцена главного меню
export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Загружаем ресурсы для меню
        this.load.image('menuBackground', 'assets/menu_background.png');
        
        // Загружаем музыку для меню
        this.load.audio('menuMusic', 'assets/sounds/menu_background.wav');
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Останавливаем предыдущую музыку, если она играет
        if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
            window.backgroundMusic.stop();
        }
        
        // Добавляем и запускаем фоновую музыку для меню (с пониженной громкостью)
        window.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.10 });
        
        // Проверяем настройки музыки
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        if (musicEnabled) {
            window.menuMusic.play();
        }
        
        // Добавляем заголовок игры
        this.add.text(960, 200, 'PSU Survivor: Titanium Hunt', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Создаем кнопки меню
        this.createButton(960, 400, 'Начать игру', () => {
            // Останавливаем музыку меню перед переходом в игру
            if (window.menuMusic && window.menuMusic.isPlaying) {
                window.menuMusic.stop();
            }
            this.scene.start('MainScene');
        });
        
        this.createButton(960, 520, 'Настройки', () => {
            this.scene.start('SettingsScene');
        });
        
        this.createButton(960, 640, 'Об игре', () => {
            this.scene.start('AboutScene');
        });
    }
    
    // Вспомогательная функция для создания кнопок
    createButton(x, y, text, callback) {
        // Создаем прямоугольник для кнопки
        const button = this.add.rectangle(x, y, 400, 80, 0x4a6fa5, 0.8);
        button.setStrokeStyle(2, 0xffffff);
        
        // Добавляем текст на кнопку
        const buttonText = this.add.text(x, y, text, {
            fontSize: '32px',
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
