// Сцена настроек
import { CyberButton, CyberTitle, CyberSwitch } from '../../ui/index.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.uiElements = []; // Массив для хранения UI элементов
    }

    preload() {
        // Загружаем ресурсы для сцены настроек
        this.load.image('menuBackground', 'assets/ui/menu_background.png');
        
        // Загружаем изображения для переключателей
        this.load.image('checkbox_on', 'assets/ui/checkbox_on.png');
        this.load.image('checkbox_off', 'assets/ui/checkbox_off.png');
        
        // Загружаем иконки
        this.load.image('soundIcon', 'assets/ui/sound.png');
        this.load.image('musicIcon', 'assets/ui/music.png');
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Добавляем заголовок с использованием CyberTitle
        const title = new CyberTitle(
            this, 
            960, 
            200, 
            'Настройки', 
            { 
                fontSize: 64,
                glowIntensity: 1.5,
                pulseAnimation: true
            }
        );
        this.uiElements.push(title);
        
        // Получаем текущие настройки из localStorage
        // По умолчанию настройки включены (установлено в game.js)
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        
        // Создаем большую иконку музыки
        const musicIcon = this.add.image(700, 450, 'musicIcon');
        musicIcon.setDisplaySize(300, 300);
        
        // Добавляем свечение для иконки музыки
        const musicGlow = this.add.image(700, 450, 'musicIcon');
        musicGlow.setDisplaySize(320, 320);
        musicGlow.setTint(0x00ffff);
        musicGlow.setAlpha(0.5);
        musicGlow.setBlendMode(Phaser.BlendModes.ADD);
        
        // Создаем переключатель для музыки (без текста)
        const musicSwitch = new CyberSwitch(
            this, 
            700, 
            600, 
            '', // Убираем текст
            musicEnabled, 
            (enabled) => {
                localStorage.setItem('musicEnabled', enabled);
                // Применяем настройку сразу
                // Для музыки игры
                if (window.backgroundMusic) {
                    if (enabled) {
                        if (!window.backgroundMusic.isPlaying && this.scene.key === 'MainScene') {
                            window.backgroundMusic.play();
                        }
                    } else {
                        window.backgroundMusic.stop();
                    }
                }
                
                // Для музыки меню
                if (window.menuMusic) {
                    if (enabled) {
                        if (!window.menuMusic.isPlaying && this.scene.key === 'MenuScene') {
                            window.menuMusic.play();
                        }
                    } else {
                        window.menuMusic.stop();
                    }
                }
            },
            {
                width: 100,
                height: 60,
                fontSize: 32
            }
        );
        this.uiElements.push(musicSwitch);
        
        // Создаем большую иконку звука
        const soundIcon = this.add.image(1220, 450, 'soundIcon');
        soundIcon.setDisplaySize(300, 300);
        
        // Добавляем свечение для иконки звука
        const soundGlow = this.add.image(1220, 450, 'soundIcon');
        soundGlow.setDisplaySize(320, 320);
        soundGlow.setTint(0x00ffff);
        soundGlow.setAlpha(0.5);
        soundGlow.setBlendMode(Phaser.BlendModes.ADD);
        
        // Создаем переключатель для звуков (без текста)
        const soundSwitch = new CyberSwitch(
            this, 
            1220, 
            600, 
            '', // Убираем текст
            soundEnabled, 
            (enabled) => {
                localStorage.setItem('soundEnabled', enabled);
                // Настройка будет применена при следующем воспроизведении звука
                // Если звуки выключены, останавливаем все текущие звуковые эффекты
                if (!enabled) {
                    if (window.explosionSound) {
                        window.explosionSound.stop();
                    }
                    if (window.nyamnyamSound) {
                        window.nyamnyamSound.stop();
                    }
                }
            },
            {
                width: 100,
                height: 60,
                fontSize: 32
            }
        );
        this.uiElements.push(soundSwitch);
        
        // Создаем кнопку "Назад" с использованием CyberButton
        const backButton = new CyberButton(
            this, 
            960, 
            800, 
            'Назад', 
            () => {
                // Переходим обратно в меню БЕЗ остановки музыки
                this.scene.start('MenuScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32
            }
        );
        // Добавляем иконку к кнопке "Назад"
        backButton.addIcon('⬅️');
        this.uiElements.push(backButton);
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