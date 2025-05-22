// Сцена выбора уровня
import { levelManager } from '../../utils/levelManager.js';

export class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() {
        // Загружаем ресурсы для сцены выбора уровня
        this.load.image('menuBackground', 'assets/ui/menu_background.png');
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Добавляем заголовок
        this.add.text(960, 200, 'Выбор уровня', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Получаем все уровни
        const levels = levelManager.getAllLevels();
        
        // Создаем кнопки для каждого уровня
        this.levelButtons = [];
        
        levels.forEach((level, index) => {
            const y = 350 + index * 100;
            
            // Создаем кнопку
            const buttonColor = level.unlocked ? 0x4a6fa5 : 0x666666;
            const button = this.add.rectangle(960, y, 600, 80, buttonColor, 0.8);
            button.setStrokeStyle(2, 0xffffff);
            
            // Добавляем текст на кнопку
            const buttonText = this.add.text(960, y, level.name, {
                fontSize: '32px',
                fill: level.unlocked ? '#ffffff' : '#aaaaaa'
            }).setOrigin(0.5);
            
            let lockIcon = null;
            
            // Если уровень заблокирован, добавляем иконку замка
            if (!level.unlocked) {
                lockIcon = this.add.text(1180, y, '🔒', {
                    fontSize: '32px'
                }).setOrigin(0.5);
                
                // Добавляем текст с условием разблокировки
                this.add.text(960, y + 30, `Нужно набрать ${level.scoreToUnlock} очков на предыдущем уровне`, {
                    fontSize: '18px',
                    fill: '#aaaaaa'
                }).setOrigin(0.5);
            }
            
            // Если уровень разблокирован, делаем кнопку интерактивной
            if (level.unlocked) {
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
                    
                    // Останавливаем музыку меню перед переходом в игру
                    if (window.menuMusic && window.menuMusic.isPlaying) {
                        window.menuMusic.stop();
                    }
                    
                    // Запускаем выбранный уровень
                    // Используем явные ключи сцен вместо получения из level.scene
                    if (level.id === 1) {
                        this.scene.start('MainScene', { levelId: level.id });
                    } else if (level.id === 2) {
                        this.scene.start('Level2Scene', { levelId: level.id });
                    } else if (level.id === 3) {
                        // Запускаем третий уровень
                        this.scene.start('Level3Scene', { levelId: level.id });
                    }
                });
            }
            
            this.levelButtons.push({ button, text: buttonText, lockIcon });
        });
        
        // Создаем кнопку "Назад"
        this.createButton(960, 800, 'Назад', () => {
            // Переходим обратно в меню БЕЗ остановки музыки
            this.scene.start('MenuScene');
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