// Вспомогательные функции для игрового уровня

import { goToNextLevel as utilsGoToNextLevel } from '../../utils/levelUtils.js';
import { updateGameUI, showGameOverUI } from './game_level_ui.js';
import { ObjectPoolManager, AudioManager } from '../../managers/index.js';

// Функция для переключения паузы
export function togglePause(scene) {
    scene.isPaused = !scene.isPaused;
    
    // Останавливаем или возобновляем физику
    if (scene.isPaused) {
        scene.physics.pause();
        scene.pauseText.visible = true;
        scene.resumeText.visible = true;
        
        // Ставим музыку на паузу через AudioManager
        const audioManager = AudioManager.getInstance();
        audioManager.pauseMusic();
    } else {
        scene.physics.resume();
        scene.pauseText.visible = false;
        scene.resumeText.visible = false;
        
        // Возобновляем музыку через AudioManager
        const audioManager = AudioManager.getInstance();
        audioManager.resumeMusic();
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
                
                // Останавливаем музыку перед переходом в меню через AudioManager
                const audioManager = AudioManager.getInstance();
                audioManager.stopMusic();
                
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
    }    // Запасной вариант, если персонаж не найден или у него нет нужного метода
    // Получаем ObjectPoolManager
    const objectPoolManager = ObjectPoolManager.getInstance();
    // Возвращаем предмет в пул
    objectPoolManager.release('goodItems', item);
      // Создаем анимацию взрыва для хорошего блока
    
    // Проверяем, является ли персонаж трейдером
    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
    const isTrader = selectedCharacter === 'trader';
    
    // Выбираем тип взрыва в зависимости от персонажа
    const animKey = isTrader ? 'money_explode' : 'good_explode';
    
    // Создаем спрайт взрыва из пула
    let explosion;
    if (isTrader) {
        explosion = objectPoolManager.get('explosions', item.x, item.y);
        if (explosion) {
            explosion.setTexture('bad_money', 'money_exposion_1.png');
        }
    } else {
        explosion = objectPoolManager.get('explosions', item.x, item.y);
        if (explosion) {
            explosion.setTexture('good_super', 'good_explosion_1.png');
        }
    }
    
    if (!explosion) {
        console.warn('Не удалось получить взрыв из пула');
        return;
    }
    
    explosion.setDisplaySize(600, 600);
    explosion.setOrigin(0.5, 0.5);
    explosion.setFlipY(false);
    explosion.anims.play(animKey);
      // Возвращаем взрыв в пул после завершения анимации
    explosion.once('animationcomplete', () => {
        objectPoolManager.release('explosions', explosion);
    });
      // Базовые очки за предмет
    let points = 10;
    
    // Применяем множитель денег персонажа, если он есть
    if (player.moneyMultiplier && player.moneyMultiplier !== 1.0) {
        points = Math.floor(points * player.moneyMultiplier);
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
    }      // Запасной вариант, если персонаж не найден или у него нет нужного метода
    // Получаем ObjectPoolManager
    const objectPoolManager = ObjectPoolManager.getInstance();
    // Возвращаем предмет в пул
    objectPoolManager.release('veryGoodItems', item);
      // Создаем анимацию взрыва для супер блока
    
    // Проверяем, является ли персонаж трейдером
    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
    const isTrader = selectedCharacter === 'trader';
    
    // Выбираем тип взрыва в зависимости от персонажа
    const animKey = isTrader ? 'money_explode' : 'super_explode';
    
    // Создаем спрайт взрыва из пула
    let explosion;
    if (isTrader) {
        explosion = objectPoolManager.get('explosions', item.x, item.y);
        if (explosion) {
            explosion.setTexture('bad_money', 'money_exposion_1.png');
        }
    } else {
        explosion = objectPoolManager.get('explosions', item.x, item.y);
        if (explosion) {
            explosion.setTexture('good_super', 'super_explosion_1.png');
            // Применяем шейдер свечения для супер-взрыва
            try {
                explosion.setPipeline('Glow');
            } catch (error) {
                console.warn('Не удалось применить шейдер свечения:', error);
            }
        }
    }
    
    if (!explosion) {
        console.warn('Не удалось получить взрыв из пула');
        return;
    }
    
    explosion.setDisplaySize(600, 600);
    explosion.setOrigin(0.5, 0.5);
    explosion.setFlipY(false);
    explosion.anims.play(animKey);
      // Возвращаем взрыв в пул после завершения анимации
    explosion.once('animationcomplete', () => {
        objectPoolManager.release('explosions', explosion);
    });
      // Базовые очки и здоровье за предмет
    let points = 20;
    let healthBonus = 10;
    
    // Применяем множитель денег персонажа, если он есть
    if (player.moneyMultiplier && player.moneyMultiplier !== 1.0) {
        points = Math.floor(points * player.moneyMultiplier);
    }
    
    // Если персонаж имеет бонус здоровья, увеличиваем восстанавливаемое здоровье
    if (player.healthBonus && player.healthBonus > 0) {
        healthBonus += player.healthBonus;
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
    // Получаем ObjectPoolManager
    const objectPoolManager = ObjectPoolManager.getInstance();
    // Возвращаем предмет в пул
    objectPoolManager.release('badItems', item);
      // Создаем анимацию взрыва
    
    // Проверяем, является ли персонаж трейдером
    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
    const isTrader = selectedCharacter === 'trader';
    
    // Выбираем тип взрыва в зависимости от персонажа
    const animKey = isTrader ? 'money_explode' : 'explode';
    
    // Создаем спрайт взрыва из пула
    let explosion;
    if (isTrader) {
        explosion = objectPoolManager.get('explosions', item.x, item.y);
        if (explosion) {
            explosion.setTexture('bad_money', 'money_exposion_1.png');
        }
    } else {        explosion = objectPoolManager.get('explosions', item.x, item.y);
        if (explosion) {
            explosion.setTexture('bad_money', 'bad_exposion_1.png');
        }
    }
    
    if (!explosion) {
        console.warn('Не удалось получить взрыв из пула');
        return;
    }
      explosion.setDisplaySize(600, 600); // Используем тот же размер, что и в items.js
    explosion.setOrigin(0.5, 0.5); // Центрируем спрайт
    explosion.setFlipY(false); // Отключаем переворот по вертикали
    explosion.anims.play(animKey);
    
    // Возвращаем взрыв в пул после завершения анимации
    explosion.once('animationcomplete', () => {
        objectPoolManager.release('explosions', explosion);
    });
    
    // Воспроизводим звук взрыва через AudioManager
    const audioManager = AudioManager.getInstance();
    audioManager.playSound('explosionSound');
      // Базовый урон
    let damage = 20;
    
    // Если персонаж имеет сопротивление урону, уменьшаем получаемый урон
    if (player.damageReduction && player.damageReduction > 0) {
        damage = Math.max(5, damage - player.damageReduction); // Минимум 5 урона
    }
    
    // Уменьшаем здоровье
    let health = scene.registry.get('health') || 100;
    health = Math.max(0, health - damage);
    scene.registry.set('health', health);
    
    // Обновляем UI здоровья через функцию updateGameUI
    updateGameUI(scene);
    
    // Проверяем, не закончилась ли игра    // Проверяем, не закончилась ли игра
    if (health <= 0) {
        scene.registry.set('health', 0);
        scene.registry.set('gameOver', true);
        
        // Показываем UI окончания игры
        showGameOverUI(scene);
          // Останавливаем игру
        scene.physics.pause();
        player.setTint(0xff0000);
    }
}