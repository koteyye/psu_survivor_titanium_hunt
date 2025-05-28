// Сцена выбора уровня
import { levelManager } from '../../utils/levelManager.js';
import { CyberButton, CyberTitle } from '../../ui/index.js';

export class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() {
        // Загружаем ресурсы для сцены выбора уровня
        this.load.image('menuBackground', 'assets/ui/menu_background.png');
    }

    create() {
        // Создаем темно-синий фон в киберпанк-стиле
        this.add.rectangle(960, 540, 1920, 1080, 0x0a0f1c).setAlpha(0.9);
        
        // Добавляем фоновое изображение с пониженной прозрачностью
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080).setAlpha(0.3);
        
        // Останавливаем музыку игры, если она играет
        if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
            window.backgroundMusic.stop();
        }
        
        // Музыка продолжает играть с предыдущего экрана
        
        // Добавляем заголовок с использованием CyberTitle
        const title = new CyberTitle(
            this,
            960,
            200,
            'Выбор уровня',
            {
                fontSize: 64,
                fontFamily: 'Orbitron, sans-serif',
                color: '#00f7ff',
                glowIntensity: 1.8,
                pulseAnimation: true
            }
        );
        
        // Массив для хранения UI элементов
        this.uiElements = [];
        this.uiElements.push(title);
        
        // Получаем все уровни
        const levels = levelManager.getAllLevels();
        
        // Создаем кнопки для каждого уровня
        this.levelButtons = [];
        
        levels.forEach((level, index) => {
            const y = 350 + index * 120; // Увеличиваем расстояние между кнопками
            
            if (level.unlocked) {
                // Создаем кнопку с использованием CyberButton для разблокированных уровней
                const button = new CyberButton(
                    this,
                    960,
                    y,
                    level.name,
                    () => {
                        // Останавливаем музыку меню перед переходом в игру
                        if (window.menuMusic && window.menuMusic.isPlaying) {
                            window.menuMusic.stop();
                        }
                        
                        // Получаем выбранного персонажа
                        const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
                        
                        // Запускаем выбранный уровень с передачей информации о выбранном персонаже
                        if (level.id === 1) {
                            this.scene.start('MainScene', { levelId: level.id, character: selectedCharacter });
                        } else if (level.id === 2) {
                            this.scene.start('Level2Scene', { levelId: level.id, character: selectedCharacter });
                        } else if (level.id === 3) {
                            this.scene.start('Level3Scene', { levelId: level.id, character: selectedCharacter });
                        }
                    },
                    {
                        width: 600,
                        height: 80,
                        fontSize: 32,
                        fontFamily: 'Orbitron, sans-serif',
                        pulseAnimation: true
                    }
                );
                
                this.uiElements.push(button);
                this.levelButtons.push({ button });
            } else {
                // Для заблокированных уровней создаем неактивную кнопку
                const lockedButton = this.add.rectangle(960, y, 600, 80, 0x333333, 0.8);
                lockedButton.setStrokeStyle(2, 0x666666);
                
                // Добавляем текст на кнопку
                const buttonText = this.add.text(960, y, level.name, {
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '32px',
                    fill: '#666666'
                }).setOrigin(0.5);
                
                // Добавляем иконку замка
                const lockIcon = this.add.text(1180, y, '🔒', {
                    fontSize: '32px'
                }).setOrigin(0.5);
                
                // Добавляем текст с условием разблокировки
                const unlockText = this.add.text(960, y + 30, `Нужно набрать ${level.scoreToUnlock} очков на предыдущем уровне`, {
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '18px',
                    fill: '#666666'
                }).setOrigin(0.5);
                
                this.levelButtons.push({ button: lockedButton, text: buttonText, lockIcon, unlockText });
            }
        });
        
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
                fontSize: 32,
                fontFamily: 'Orbitron, sans-serif'
            }
        );
        this.uiElements.push(backButton);
    }
    
    // Очищаем ресурсы при уничтожении сцены
    shutdown() {
        // Уничтожаем все UI элементы
        if (this.uiElements) {
            this.uiElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.uiElements = [];
        }
    }
}