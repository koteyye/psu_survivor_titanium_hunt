// Импортируем необходимые функции из модулей
import { preloadResources } from './mainScenePreload.js';
import { createGameObjects } from './mainSceneCreate.js';
import { updateGame } from './mainSceneUpdate.js';
import { restartGame } from '../objects/player.js';

// Класс основной сцены игры
export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.isPaused = false;
    }

    // Загрузка ресурсов
    preload() {
        preloadResources(this);
    }

    // Создание игровых объектов
    create() {
        createGameObjects(this);
        
        // Добавляем обработчик клавиши паузы (P)
        this.input.keyboard.on('keydown-P', () => {
            this.togglePause();
        });
        
        // Добавляем обработчик клавиши меню (M)
        this.input.keyboard.on('keydown-M', () => {
            this.returnToMenu();
        });
        
        // Добавляем обработчик изменения размера окна
        this.scale.on('resize', this.handleResize, this);
        
        // Создаем текст для паузы
        this.pauseText = this.add.text(960, 540, 'ПАУЗА', { 
            fontSize: '96px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.visible = false;
        
        // Создаем текст с подсказкой для продолжения игры
        this.resumeText = this.add.text(960, 660, 'Нажмите P для продолжения', { 
            fontSize: '42px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.resumeText.setOrigin(0.5);
        this.resumeText.visible = false;
        
        // Создаем текст с подсказками по управлению
        const controlsText = this.add.text(960, 80, 'Управление: ← → - движение, P - пауза, R - перезапуск, M - меню', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        });
        controlsText.setOrigin(0.5);
        
        // Скрываем подсказку через 5 секунд
        this.time.delayedCall(5000, () => {
            controlsText.destroy();
        });
    }

    // Обновление игры
    update(time) {
        // Если игра на паузе, не обновляем игровую логику
        if (this.isPaused) return;
        
        updateGame(this, time);
    }
    
    // Метод для переключения паузы
    togglePause() {
        this.isPaused = !this.isPaused;
        
        // Останавливаем или возобновляем физику
        if (this.isPaused) {
            this.physics.pause();
            this.pauseText.visible = true;
            this.resumeText.visible = true;
            
            // Если музыка играет, ставим на паузу
            if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
                window.backgroundMusic.pause();
            }
        } else {
            this.physics.resume();
            this.pauseText.visible = false;
            this.resumeText.visible = false;
            
            // Если музыка была включена в настройках, возобновляем
            const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
            if (musicEnabled && window.backgroundMusic && !window.backgroundMusic.isPlaying) {
                window.backgroundMusic.resume();
            }
        }
    }
    
    // Метод для обработки изменения размера окна
    handleResize(gameSize) {
        // Обновляем позиции текстовых элементов
        if (window.scoreText) {
            window.scoreText.setPosition(40, 40);
        }
        
        if (window.healthText) {
            window.healthText.setPosition(40, 100);
        }
        
        if (window.gameOverText) {
            window.gameOverText.setPosition(gameSize.width / 2, gameSize.height / 2);
        }
        
        if (window.restartText) {
            window.restartText.setPosition(gameSize.width / 2, gameSize.height / 2 + 120);
        }
        
        if (this.pauseText) {
            this.pauseText.setPosition(gameSize.width / 2, gameSize.height / 2);
        }
        
        if (this.resumeText) {
            this.resumeText.setPosition(gameSize.width / 2, gameSize.height / 2 + 120);
        }
        
        if (this.confirmMenuText) {
            this.confirmMenuText.setPosition(gameSize.width / 2, 300);
        }
    }
    
    // Метод для быстрого перезапуска игры
    restartGameScene() {
        if (window.gameOver) {
            restartGame(this);
        }
    }
    
    // Метод для возврата в меню
    returnToMenu() {
        // Показываем текст подтверждения возврата в меню, если его ещё нет
        if (!this.confirmMenuText) {
            this.confirmMenuText = this.add.text(960, 300, 'Вернуться в меню? (M - да, Esc - нет)', {
                fontSize: '36px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 8 }
            });
            this.confirmMenuText.setOrigin(0.5);
            
            // Добавляем клавишу Esc для отмены, если её ещё нет
            if (!window.escKey) {
                window.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            }
            
            // Ставим игру на паузу
            this.isPaused = true;
            this.physics.pause();
            
            // Добавляем обработчик для подтверждения
            const mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
            
            // Создаем одноразовый обработчик для клавиши M
            const menuHandler = () => {
                // Удаляем текст подтверждения
                if (this.confirmMenuText) {
                    this.confirmMenuText.destroy();
                    this.confirmMenuText = null;
                }
                
                // Останавливаем музыку перед переходом в меню
                if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
                    window.backgroundMusic.stop();
                }
                
                // Переходим в меню
                this.scene.start('MenuScene');
                
                // Удаляем обработчик
                mKey.removeListener('down', menuHandler);
            };
            
            // Добавляем обработчик для клавиши M
            mKey.once('down', menuHandler);
            
            // Создаем одноразовый обработчик для клавиши Esc
            const escHandler = () => {
                // Удаляем текст подтверждения
                if (this.confirmMenuText) {
                    this.confirmMenuText.destroy();
                    this.confirmMenuText = null;
                }
                
                // Возобновляем физику
                this.isPaused = false;
                this.physics.resume();
                
                // Удаляем обработчик
                window.escKey.removeListener('down', escHandler);
                mKey.removeListener('down', menuHandler);
            };
            
            // Добавляем обработчик для клавиши Esc
            window.escKey.once('down', escHandler);
        }
    }
}
