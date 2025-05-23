// Вспомогательные функции для игрового уровня

import { goToNextLevel as utilsGoToNextLevel } from '../../utils/levelUtils.js';

// Функция для переключения паузы
export function togglePause(scene) {
    scene.isPaused = !scene.isPaused;
    
    // Останавливаем или возобновляем физику
    if (scene.isPaused) {
        scene.physics.pause();
        scene.pauseText.visible = true;
        scene.resumeText.visible = true;
        
        // Если музыка играет, ставим на паузу
        if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
            window.backgroundMusic.pause();
        }
    } else {
        scene.physics.resume();
        scene.pauseText.visible = false;
        scene.resumeText.visible = false;
        
        // Если музыка была включена в настройках, возобновляем
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        if (musicEnabled && window.backgroundMusic && !window.backgroundMusic.isPlaying) {
            window.backgroundMusic.resume();
        }
    }
}

// Функция для обработки изменения размера окна
export function handleResize(scene, gameSize) {
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
    
    if (scene.pauseText) {
        scene.pauseText.setPosition(gameSize.width / 2, gameSize.height / 2);
    }
    
    if (scene.resumeText) {
        scene.resumeText.setPosition(gameSize.width / 2, gameSize.height / 2 + 120);
    }
    
    if (scene.levelNameText) {
        scene.levelNameText.setPosition(gameSize.width / 2, 40);
    }
    
    if (scene.levelGoalText) {
        scene.levelGoalText.setPosition(gameSize.width / 2, 100);
    }
    
    if (scene.levelCompletedText) {
        scene.levelCompletedText.setPosition(gameSize.width / 2, gameSize.height / 2);
    }
    
    if (scene.nextLevelText) {
        scene.nextLevelText.setPosition(gameSize.width / 2, gameSize.height / 2 + 120);
    }
    
    if (scene.confirmMenuText) {
        scene.confirmMenuText.setPosition(gameSize.width / 2, 300);
    }
}

// Функция для создания подтверждающего диалога
export function createConfirmationDialog(scene, text, yesKey, noKey, onConfirm, onCancel) {
    // Создаем текст подтверждения
    const confirmText = scene.add.text(960, 300, text, {
        fontSize: '36px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 }
    });
    confirmText.setOrigin(0.5);
    
    // Ставим игру на паузу
    scene.isPaused = true;
    scene.physics.pause();
    
    // Настраиваем клавиши
    const yesKeyObj = scene.input.keyboard.addKey(yesKey);
    const noKeyObj = noKey === Phaser.Input.Keyboard.KeyCodes.ESC 
        ? (window.escKey || scene.input.keyboard.addKey(noKey))
        : scene.input.keyboard.addKey(noKey);
    
    if (noKey === Phaser.Input.Keyboard.KeyCodes.ESC) {
        window.escKey = noKeyObj;
    }
    
    // Обработчик подтверждения
    const yesHandler = () => {
        confirmText.destroy();
        yesKeyObj.removeListener('down', yesHandler);
        noKeyObj.removeListener('down', noHandler);
        onConfirm();
    };
    
    // Обработчик отмены
    const noHandler = () => {
        confirmText.destroy();
        yesKeyObj.removeListener('down', yesHandler);
        noKeyObj.removeListener('down', noHandler);
        onCancel();
    };
    
    // Добавляем обработчики
    yesKeyObj.once('down', yesHandler);
    noKeyObj.once('down', noHandler);
    
    return confirmText;
}

// Функция для возврата в меню
export function returnToMenu(scene) {
    // Показываем текст подтверждения возврата в меню, если его ещё нет
    if (!scene.confirmMenuText) {
        scene.confirmMenuText = createConfirmationDialog(
            scene,
            'Вернуться в меню? (M - да, Esc - нет)',
            Phaser.Input.Keyboard.KeyCodes.M,
            Phaser.Input.Keyboard.KeyCodes.ESC,
            // Функция при подтверждении
            () => {
                scene.confirmMenuText = null;
                
                // Останавливаем музыку перед переходом в меню
                if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
                    window.backgroundMusic.stop();
                }
                
                // Переходим в меню
                scene.scene.start('MenuScene');
            },
            // Функция при отмене
            () => {
                scene.confirmMenuText = null;
                scene.isPaused = false;
                scene.physics.resume();
            }
        );
    }
}

// Функция для перехода на следующий уровень
export function goToNextLevel(scene) {
    utilsGoToNextLevel(scene, scene.levelId);
}

// Функция для отскока от стены
export function bounceOffWall(item, wall) {
    // Отскок от стены с небольшим случайным изменением скорости
    item.setVelocityX(-item.body.velocity.x * Phaser.Math.FloatBetween(0.9, 1.1));
}

// Функция для сбора хорошего предмета
export function collectGoodItem(player, item) {
    item.disableBody(true, true);
    
    // Для обычного хорошего блока не воспроизводим звук "нямням"
    
    // Увеличиваем счет
    window.score += 10;
    window.scoreText.setText('Очки: ' + window.score);
}

// Функция для сбора очень хорошего предмета
export function collectVeryGoodItem(player, item) {
    item.disableBody(true, true);
    
    // Проверяем настройки звука
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (soundEnabled) {
        window.nyamnyamSound.play();
    }
    
    // Увеличиваем счет и здоровье
    window.score += 20;
    window.scoreText.setText('Очки: ' + window.score);
    
    window.health = Math.min(window.health + 10, 100);
    window.healthText.setText('Здоровье: ' + window.health);
}

// Функция для столкновения с плохим предметом
export function hitBadItem(scene, player, item) {
    item.disableBody(true, true);
    
    // Создаем анимацию взрыва
    const explosion = window.explosions.create(item.x, item.y, 'explosion');
    explosion.setDisplaySize(600, 600); // Используем тот же размер, что и в items.js
    explosion.setOrigin(0.5, 0.5); // Центрируем спрайт
    explosion.setFlipY(false); // Отключаем переворот по вертикали
    explosion.anims.play('explode');
    
    // Проверяем настройки звука
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (soundEnabled) {
        window.explosionSound.play();
    }
    
    // Уменьшаем здоровье
    window.health -= 20;
    window.healthText.setText('Здоровье: ' + window.health);
    
    // Проверяем, не закончилась ли игра
    if (window.health <= 0) {
        window.health = 0;
        window.healthText.setText('Здоровье: 0');
        window.gameOver = true;
        
        // Показываем текст окончания игры
        window.gameOverText.visible = true;
        window.restartText.visible = true;
        
        // Останавливаем игру
        scene.physics.pause();
        player.setTint(0xff0000);
    }
    
    // Удаляем взрыв после окончания анимации
    explosion.on('animationcomplete', function() {
        explosion.destroy();
    });
}