// Сцена главного меню
import { levelManager } from '../../utils/levelManager.js';
import { CyberButton, CyberTitle } from '../../ui/index.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.uiElements = []; // Массив для хранения UI элементов
    }

    preload() {
        // Загружаем ресурсы для меню
        this.load.image('menuBackground', 'assets/ui/menu_background.png');
        
        // Загружаем музыку для меню
        this.load.audio('menuMusic', 'assets/sounds/menu/menu_background.wav');
        
        // Загружаем иконки для UI
        this.load.image('soundIcon', 'assets/ui/sound.png');
        this.load.image('healthIcon', 'assets/ui/health.png');
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Останавливаем музыку игры, если она играет
        if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
            window.backgroundMusic.stop();
        }
        
        // Добавляем и запускаем фоновую музыку для меню (с пониженной громкостью)
        // Проверяем, играет ли уже музыка меню
        if (!window.menuMusic || !window.menuMusic.isPlaying) {
            // Если музыка не играет, создаем и запускаем ее
            window.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.10 });
            
            // Проверяем настройки музыки
            const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
            if (musicEnabled) {
                window.menuMusic.play();
            }
        }
        
        // Добавляем заголовок игры с использованием CyberTitle
        const title = new CyberTitle(
            this, 
            960, 
            200, 
            'PSU Survivor: Titanium Hunt', 
            { 
                fontSize: 64,
                glowIntensity: 1.5,
                pulseAnimation: true
            }
        );
        this.uiElements.push(title);
        
        // Создаем кнопки меню с использованием CyberButton
        const startButton = new CyberButton(
            this, 
            960, 
            400, 
            'Начать игру', 
            () => {
                // Останавливаем музыку меню перед переходом в игру
                if (window.menuMusic && window.menuMusic.isPlaying) {
                    window.menuMusic.stop();
                }
                
                // Всегда начинаем с первого уровня (MainScene)
                this.scene.start('MainScene', { levelId: 1 });
            },
            {
                width: 400,
                height: 80,
                fontSize: 32,
                pulseAnimation: true
            }
        );
        this.uiElements.push(startButton);
        
        const levelSelectButton = new CyberButton(
            this, 
            960, 
            500, 
            'Выбор уровня', 
            () => {
                // Переходим на сцену выбора уровня БЕЗ остановки музыки
                this.scene.start('LevelSelectScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32
            }
        );
        this.uiElements.push(levelSelectButton);
        
        const settingsButton = new CyberButton(
            this, 
            960, 
            600, 
            'Настройки', 
            () => {
                // Переходим на сцену настроек БЕЗ остановки музыки
                this.scene.start('SettingsScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32
            }
        );
        // Добавляем иконку к кнопке настроек
        settingsButton.addIcon('⚙️');
        this.uiElements.push(settingsButton);
        
        const aboutButton = new CyberButton(
            this, 
            960, 
            700, 
            'Об игре', 
            () => {
                // Переходим на сцену "Об игре" БЕЗ остановки музыки
                this.scene.start('AboutScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32
            }
        );
        // Добавляем иконку к кнопке "Об игре"
        aboutButton.addIcon('ℹ️');
        this.uiElements.push(aboutButton);
    }
    
    // Очищаем ресурсы при уничтожении сцены
    shutdown() {
        // Уничтожаем все UI элементы
        this.uiElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.uiElements = [];
    }
}