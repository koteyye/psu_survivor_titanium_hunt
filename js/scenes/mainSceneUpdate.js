// Импортируем необходимые функции
import { spawnItems } from '../objects/items.js';
import { restartGame } from '../objects/player.js';

// Функция обновления игры для MainScene
export function updateGame(scene, time) {
    // Создаем клавишу R для быстрого перезапуска, если её ещё нет
    if (!window.rKey) {
        window.rKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
    
    if (window.gameOver) {
        // Проверяем нажатие пробела или R для перезапуска игры
        if (window.cursors.space.isDown || window.rKey.isDown) {
            restartGame(scene);
        }
        return;
    }
    
    // Проверяем нажатие R для быстрого перезапуска в любой момент
    if (window.rKey.isDown) {
        // Показываем текст подтверждения перезапуска, если его ещё нет
        if (!window.confirmRestartText) {
            window.confirmRestartText = scene.add.text(960, 300, 'Перезапустить игру? (R - да, Esc - нет)', {
                fontSize: '36px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 8 }
            });
            window.confirmRestartText.setOrigin(0.5);
            
            // Добавляем клавишу Esc для отмены
            window.escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            
            // Ставим игру на паузу
            scene.isPaused = true;
            scene.physics.pause();
        }
        
        // Если R всё ещё нажата, перезапускаем игру
        if (window.rKey.getDuration() > 1000) {
            // Удаляем текст подтверждения
            if (window.confirmRestartText) {
                window.confirmRestartText.destroy();
                window.confirmRestartText = null;
            }
            
            // Возобновляем физику
            scene.isPaused = false;
            scene.physics.resume();
            
            // Перезапускаем игру
            restartGame(scene);
        }
    }
    
    // Проверяем нажатие Esc для отмены перезапуска
    if (window.escKey && window.escKey.isDown && window.confirmRestartText) {
        // Удаляем текст подтверждения
        window.confirmRestartText.destroy();
        window.confirmRestartText = null;
        
        // Возобновляем физику
        scene.isPaused = false;
        scene.physics.resume();
    }
    
    // Если игра на паузе из-за подтверждения перезапуска, не обновляем остальную логику
    if (scene.isPaused) return;

    // Управление игроком
    if (window.cursors.left.isDown) {
        window.player.setVelocityX(-450); // Увеличенная скорость
        window.player.setAngle(-15); // Наклон влево на 15 градусов
    } else if (window.cursors.right.isDown) {
        window.player.setVelocityX(450); // Увеличенная скорость
        window.player.setAngle(15); // Наклон вправо на 15 градусов
    } else {
        window.player.setVelocityX(0);
        window.player.setAngle(0); // Возвращаем в нормальное положение
    }

    // Создание новых объектов
    if (time > window.itemSpawnTime) {
        spawnItems(scene);
        window.itemSpawnTime = time + Phaser.Math.Between(500, 1500);
    }
    
    // Обновление позиции текста для всех объектов
    window.goodItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
    
    window.badItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
    
    window.veryGoodItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
    
    // Проверяем и обновляем объекты взрыва
    if (window.explosions && window.explosions.getChildren) {
        window.explosions.getChildren().forEach(explosion => {
            // Проверяем, что объект существует и имеет свойство anims
            if (explosion && explosion.anims) {
                // Если анимация не воспроизводится или объект находится за пределами экрана, удаляем его
                if (!explosion.anims.isPlaying || explosion.y > 1200 || explosion.y < -200) {
                    console.log('Удаляем объект взрыва из update:', explosion);
                    explosion.destroy();
                }
            } else if (explosion) {
                // Если у объекта нет свойства anims, удаляем его через 1 секунду
                if (!explosion.cleanupTimer) {
                    explosion.cleanupTimer = true;
                    scene.time.delayedCall(1000, () => {
                        if (explosion && explosion.active) {
                            console.log('Удаляем объект взрыва по таймеру из update');
                            explosion.destroy();
                        }
                    });
                }
            }
        });
    }
    
    // Удаляем объекты, которые вышли за пределы экрана
    const cleanupItems = (group) => {
        if (group && group.getChildren) {
            group.getChildren().forEach(item => {
                if (item.y > 1200) {
                    // Удаляем текст, если он есть
                    if (item.itemText) {
                        item.itemText.destroy();
                    }
                    // Удаляем сам объект
                    item.destroy();
                }
            });
        }
    };
    
    cleanupItems(window.goodItems);
    cleanupItems(window.badItems);
    cleanupItems(window.veryGoodItems);
}
