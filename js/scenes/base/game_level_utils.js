// Вспомогательные функции для игрового уровня

import { goToNextLevel as utilsGoToNextLevel } from '../../utils/levelUtils.js';
import { updateGameUI, showGameOverUI } from './game_level_ui.js';

// Функция для переключения паузы
export function togglePause(scene) {
    scene.isPaused = !scene.isPaused;
    
    // Останавливаем или возобновляем физику
    if (scene.isPaused) {
        scene.physics.pause();
        scene.pauseText.visible = true;
        scene.resumeText.visible = true;
        
        // Если музыка играет, ставим на паузу
        const backgroundMusic = scene.registry.get('backgroundMusic');
        if (backgroundMusic && backgroundMusic.isPlaying) {
            backgroundMusic.pause();
        }
    } else {
        scene.physics.resume();
        scene.pauseText.visible = false;
        scene.resumeText.visible = false;
        
        // Если музыка была включена в настройках, возобновляем
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        const backgroundMusic = scene.registry.get('backgroundMusic');
        if (musicEnabled && backgroundMusic && !backgroundMusic.isPlaying) {
            backgroundMusic.resume();
        }
    }
}

// Функция для обработки изменения размера окна
export function handleResize(scene, gameSize) {
    // Обновляем позиции текстовых элементов
    const scoreText = scene.registry.get('scoreText');
    if (scoreText) {
        scoreText.setPosition(80, 40);
    }
    
    const gameOverText = scene.registry.get('gameOverText');
    if (gameOverText) {
        gameOverText.setPosition(gameSize.width / 2, gameSize.height / 2);
    }
    
    const restartText = scene.registry.get('restartText');
    if (restartText) {
        restartText.setPosition(gameSize.width / 2, gameSize.height / 2 + 120);
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
    const escKey = scene.registry.get('escKey');
    const noKeyObj = noKey === Phaser.Input.Keyboard.KeyCodes.ESC
        ? (escKey || scene.input.keyboard.addKey(noKey))
        : scene.input.keyboard.addKey(noKey);
    
    if (noKey === Phaser.Input.Keyboard.KeyCodes.ESC) {
        scene.registry.set('escKey', noKeyObj);
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
                const backgroundMusic = scene.registry.get('backgroundMusic');
                if (backgroundMusic && backgroundMusic.isPlaying) {
                    backgroundMusic.stop();
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
export function collectGoodItem(scene, player, item) {
    // Получаем персонажа из Registry
    const gameCharacter = scene.registry.get('gameCharacter');
    
    // Если персонаж существует и у него есть метод collectGoodItem, используем его
    if (gameCharacter && gameCharacter.collectGoodItem) {
        gameCharacter.collectGoodItem(item);
        return;
    }
    
    // Запасной вариант, если персонаж не найден или у него нет нужного метода
    item.disableBody(true, true);
    
    // Создаем анимацию взрыва для хорошего блока
    const explosions = scene.registry.get('explosions');
    
    // Проверяем, является ли персонаж трейдером
    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
    const isTrader = selectedCharacter === 'trader';
    
    // Выбираем тип взрыва в зависимости от персонажа
    const animKey = isTrader ? 'money_explode' : 'good_explode';
    
    // Создаем спрайт взрыва
    let explosion;
    if (isTrader) {
        explosion = explosions.create(item.x, item.y, 'explosions', 'money_explosion.png');
    } else {
        // Используем новую анимацию для хорошего блока
        explosion = explosions.create(item.x, item.y, 'good_super', 'good_explosion_1.png');
    }
    
    explosion.setDisplaySize(600, 600);
    explosion.setOrigin(0.5, 0.5);
    explosion.setFlipY(false);
    explosion.anims.play(animKey);
    
    // Удаляем взрыв после завершения анимации
    explosion.once('animationcomplete', () => {
        explosion.destroy();
    });
    
    // Базовые очки за предмет
    let points = 10;
    
    // Применяем бонус денег, если он есть у персонажа (Торговец)
    if (player.moneyBonus) {
        points = Math.floor(points * player.moneyBonus);
    }
    
    // Увеличиваем счет
    let score = scene.registry.get('score') || 0;
    score += points;
    scene.registry.set('score', score);
    
    // Обновляем UI
    const scoreText = scene.registry.get('scoreText');
    if (scoreText) {
        scoreText.setText('Очки: ' + score);
    }
}

// Функция для сбора очень хорошего предмета
export function collectVeryGoodItem(scene, player, item) {
    // Получаем персонажа из Registry
    const gameCharacter = scene.registry.get('gameCharacter');
    
    // Если персонаж существует и у него есть метод collectVeryGoodItem, используем его
    if (gameCharacter && gameCharacter.collectVeryGoodItem) {
        gameCharacter.collectVeryGoodItem(item);
        return;
    }
    
    // Запасной вариант, если персонаж не найден или у него нет нужного метода
    item.disableBody(true, true);
    
    // Создаем анимацию взрыва для супер блока
    const explosions = scene.registry.get('explosions');
    
    // Проверяем, является ли персонаж трейдером
    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
    const isTrader = selectedCharacter === 'trader';
    
    // Выбираем тип взрыва в зависимости от персонажа
    const animKey = isTrader ? 'money_explode' : 'super_explode';
    
    // Создаем спрайт взрыва
    let explosion;
    if (isTrader) {
        explosion = explosions.create(item.x, item.y, 'explosions', 'money_explosion.png');
    } else {
        // Используем новую анимацию для супер блока
        explosion = explosions.create(item.x, item.y, 'good_super', 'super_explosion_1.png');
        
        // Применяем шейдер свечения для супер-взрыва
        try {
            explosion.setPipeline('Glow');
        } catch (error) {
            console.warn('Не удалось применить шейдер свечения:', error);
        }
    }
    
    explosion.setDisplaySize(600, 600);
    explosion.setOrigin(0.5, 0.5);
    explosion.setFlipY(false);
    explosion.anims.play(animKey);
    
    // Удаляем взрыв после завершения анимации
    explosion.once('animationcomplete', () => {
        explosion.destroy();
    });
    
    // Базовые очки и здоровье за предмет
    let points = 20;
    let healthBonus = 10;
    
    // Применяем бонус денег, если он есть у персонажа (Торговец)
    if (player.moneyBonus) {
        points = Math.floor(points * player.moneyBonus);
    }
    
    // Если персонаж Фриндер, увеличиваем бонус здоровья
    if (player.speedBonus) {
        healthBonus = 15; // Фриндер получает больше здоровья
    }
    
    // Увеличиваем счет и здоровье
    let score = scene.registry.get('score') || 0;
    let health = scene.registry.get('health') || 100;
    
    score += points;
    health = Math.min(health + healthBonus, 100);
    
    scene.registry.set('score', score);
    scene.registry.set('health', health);
    
    // Обновляем UI
    const scoreText = scene.registry.get('scoreText');
    if (scoreText) {
        scoreText.setText('Очки: ' + score);
    }
    
    // Обновляем UI здоровья через функцию updateGameUI
    updateGameUI(scene);
}

// Функция для столкновения с плохим предметом
export function hitBadItem(scene, player, item) {
    // Получаем персонажа из Registry
    const gameCharacter = scene.registry.get('gameCharacter');
    
    // Если персонаж существует и у него есть метод hitBadItem, используем его
    if (gameCharacter && gameCharacter.hitBadItem) {
        gameCharacter.hitBadItem(item);
        return;
    }
    
    // Запасной вариант, если персонаж не найден или у него нет нужного метода
    item.disableBody(true, true);
    
    // Создаем анимацию взрыва
    const explosions = scene.registry.get('explosions');
    
    // Проверяем, является ли персонаж трейдером
    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
    const isTrader = selectedCharacter === 'trader';
    
    // Выбираем тип взрыва в зависимости от персонажа
    const animKey = isTrader ? 'money_explode' : 'explode';
    
    // Создаем спрайт взрыва
    let explosion;
    if (isTrader) {
        // Используем новую анимацию для трейдера (money_explosion)
        explosion = explosions.create(item.x, item.y, 'bad_money', 'money_exposion_1.png');
    } else {
        // Используем новую анимацию для плохих блоков
        explosion = explosions.create(item.x, item.y, 'bad_money', 'bad_exposion_1.png');
    }
    
    explosion.setDisplaySize(600, 600); // Используем тот же размер, что и в items.js
    explosion.setOrigin(0.5, 0.5); // Центрируем спрайт
    explosion.setFlipY(false); // Отключаем переворот по вертикали
    explosion.anims.play(animKey);
    
    // Удаляем взрыв после завершения анимации
    explosion.once('animationcomplete', () => {
        explosion.destroy();
    });
    
    // Проверяем настройки звука
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    const explosionSound = scene.registry.get('explosionSound');
    if (soundEnabled && explosionSound) {
        explosionSound.play();
    }
    
    // Базовый урон
    let damage = 20;
    
    // Если персонаж Зуммер, уменьшаем получаемый урон
    if (player.attackSpeedBonus) {
        damage = 15; // Зуммер получает меньше урона
    }
    
    // Уменьшаем здоровье
    let health = scene.registry.get('health') || 100;
    health -= damage;
    scene.registry.set('health', health);
    
    // Обновляем UI здоровья через функцию updateGameUI
    updateGameUI(scene);
    
    // Проверяем, не закончилась ли игра
    if (health <= 0) {
        scene.registry.set('health', 0);
        scene.registry.set('gameOver', true);
        
        // Показываем UI окончания игры
        showGameOverUI(scene);
        
        // Останавливаем игру
        scene.physics.pause();
        player.setTint(0xff0000);
    }
    
    // Удаляем взрыв после окончания анимации
    explosion.on('animationcomplete', function() {
        explosion.destroy();
    });
}