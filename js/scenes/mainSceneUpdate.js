// Импортируем необходимые функции
import { spawnItems } from '../objects/items.js';
import { restartGame } from '../objects/player.js';

// Функция инициализации клавиш управления
function initializeControls(scene) {
    if (!window.rKey) {
        window.rKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
}

// Функция обработки состояния игры "Game Over"
function handleGameOver(scene) {
    if (!window.gameOver) return false;
    
    if (window.cursors.space.isDown || window.rKey.isDown) {
        restartGame(scene);
    }
    
    return true;
}

// Функция обработки перезапуска игры
function handleRestartRequest(scene) {
    if (!window.rKey.isDown) return false;
    
    if (!window.confirmRestartText) {
        window.confirmRestartText = scene.add.text(960, 300, 'Перезапустить игру? (R - да, Esc - нет)', {
            fontSize: '36px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        });
        window.confirmRestartText.setOrigin(0.5);
        
        window.escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        scene.isPaused = true;
        scene.physics.pause();
    }
    
    if (window.rKey.getDuration() > 1000) {
        if (window.confirmRestartText) {
            window.confirmRestartText.destroy();
            window.confirmRestartText = null;
        }
        
        scene.isPaused = false;
        scene.physics.resume();
        
        restartGame(scene);
    }
    
    return true;
}

// Функция обработки отмены перезапуска
function handleRestartCancel(scene) {
    if (!(window.escKey && window.escKey.isDown && window.confirmRestartText)) return false;
    
    window.confirmRestartText.destroy();
    window.confirmRestartText = null;
    
    scene.isPaused = false;
    scene.physics.resume();
    
    return true;
}

// Функция управления игроком
function handlePlayerMovement() {
    if (window.cursors.left.isDown) {
        window.player.setVelocityX(-450);
        window.player.setAngle(-15);
    } else if (window.cursors.right.isDown) {
        window.player.setVelocityX(450);
        window.player.setAngle(15);
    } else {
        window.player.setVelocityX(0);
        window.player.setAngle(0);
    }
}

// Функция создания новых объектов
function handleItemSpawning(scene, time) {
    if (time > window.itemSpawnTime) {
        spawnItems(scene);
        window.itemSpawnTime = time + Phaser.Math.Between(500, 1500);
    }
}

// Функция обновления объектов
function updateGameObjects(scene) {
    // Обновление всех типов предметов
    [window.goodItems, window.badItems, window.veryGoodItems].forEach(group => {
        if (group && group.getChildren) {
            group.getChildren().forEach(item => {
                if (item.update) item.update();
            });
        }
    });
    
    // Обновление взрывов
    if (window.explosions && window.explosions.getChildren) {
        window.explosions.getChildren().forEach(explosion => {
            if (explosion && explosion.anims) {
                if (!explosion.anims.isPlaying || explosion.y > 1200 || explosion.y < -200) {
                    explosion.destroy();
                }
            } else if (explosion && !explosion.cleanupTimer) {
                explosion.cleanupTimer = true;
                scene.time.delayedCall(1000, () => {
                    if (explosion && explosion.active) {
                        explosion.destroy();
                    }
                });
            }
        });
    }
    
    // Очистка предметов за пределами экрана
    [window.goodItems, window.badItems, window.veryGoodItems].forEach(group => {
        if (group && group.getChildren) {
            group.getChildren().forEach(item => {
                if (item.y > 1200) {
                    if (item.itemText) {
                        item.itemText.destroy();
                    }
                    item.destroy();
                }
            });
        }
    });
}

// Функция обновления игры для MainScene
export function updateGame(scene, time) {
    // Инициализация клавиш
    initializeControls(scene);
    
    // Обработка состояния Game Over
    if (handleGameOver(scene)) return;
    
    // Обработка запроса на перезапуск
    handleRestartRequest(scene);
    
    // Обработка отмены перезапуска
    handleRestartCancel(scene);
    
    // Если игра на паузе, не обновляем остальную логику
    if (scene.isPaused) return;
    
    // Управление игроком
    handlePlayerMovement();
    
    // Создание новых объектов
    handleItemSpawning(scene, time);
    
    // Обновление игровых объектов
    updateGameObjects(scene);
}
