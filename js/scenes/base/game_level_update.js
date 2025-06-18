// Функции для обновления игрового процесса

import { spawnLevelItems } from '../../utils/levelUtils.js';
import { restartGame } from '../../objects/player.js';
import { updateGameUI } from './game_level_ui.js';

// Основная функция обновления игры
export function updateLevel(scene, time) {
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
    handlePlayerMovement(scene);
    
    // Создание новых объектов
    handleItemSpawning(scene, time);
    
    // Обновление игровых объектов
    updateGameObjects(scene);
    
    // Обновление UI
    updateGameUI(scene);
    
    // Проверка условий завершения уровня
    checkLevelCompletion(scene, time);
}

// Функция инициализации клавиш управления
function initializeControls(scene) {
    // Получаем клавиши из Registry или создаем их
    let rKey = scene.registry.get('rKey');
    if (!rKey) {
        rKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        scene.registry.set('rKey', rKey);
    }
    
    // Добавляем обработку пробела для перезапуска игры
    let spaceKey = scene.registry.get('spaceKey');
    if (!spaceKey) {
        spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        scene.registry.set('spaceKey', spaceKey);
    }
    
    // Создаем курсоры, если их еще нет
    let cursors = scene.registry.get('cursors');
    if (!cursors) {
        cursors = scene.input.keyboard.createCursorKeys();
        scene.registry.set('cursors', cursors);
    }
}

// Функция обработки состояния игры "Game Over"
function handleGameOver(scene) {
    // Получаем состояние игры из Registry
    const gameOver = scene.registry.get('gameOver');
    if (!gameOver) return false;
    
    // Получаем клавиши из Registry
    const spaceKey = scene.registry.get('spaceKey');
    const rKey = scene.registry.get('rKey');
    
    // Проверяем нажатие пробела или R для перезапуска
    if ((spaceKey && Phaser.Input.Keyboard.JustDown(spaceKey)) ||
        (rKey && Phaser.Input.Keyboard.JustDown(rKey))) {
        
        // Скрываем элементы Game Over перед перезапуском
        if (scene.gameOverTitle) {
            scene.gameOverTitle.setVisible(false);
        }
        if (scene.restartText) {
            scene.restartText.setVisible(false);
        }
        
        // Перезапускаем игру
        restartGame(scene);
        return true;
    }
    
    return true;
}

// Функция обработки перезапуска игры
function handleRestartRequest(scene) {
    // Получаем клавишу R из Registry
    const rKey = scene.registry.get('rKey');
    if (!rKey || !rKey.isDown) return false;
    
    // Получаем текст подтверждения из Registry
    let confirmRestartText = scene.registry.get('confirmRestartText');
    
    if (!confirmRestartText) {
        confirmRestartText = scene.add.text(960, 300, 'Перезапустить игру? (R - да, Esc - нет)', {
            fontSize: '36px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        });
        confirmRestartText.setOrigin(0.5);
        
        // Сохраняем текст в Registry
        scene.registry.set('confirmRestartText', confirmRestartText);
        
        // Создаем клавишу ESC и сохраняем в Registry
        const escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        scene.registry.set('escKey', escKey);
        
        scene.isPaused = true;
        scene.physics.pause();
    }
    
    if (rKey.getDuration() > 1000) {
        if (confirmRestartText) {
            confirmRestartText.destroy();
            scene.registry.set('confirmRestartText', null);
        }
        
        scene.isPaused = false;
        scene.physics.resume();
        
        restartGame(scene);
    }
    
    return true;
}

// Функция обработки отмены перезапуска
function handleRestartCancel(scene) {
    // Получаем клавишу ESC и текст подтверждения из Registry
    const escKey = scene.registry.get('escKey');
    const confirmRestartText = scene.registry.get('confirmRestartText');
    
    if (!(escKey && escKey.isDown && confirmRestartText)) return false;
    
    confirmRestartText.destroy();
    scene.registry.set('confirmRestartText', null);
    
    scene.isPaused = false;
    scene.physics.resume();
    
    return true;
}

// Функция управления игроком
function handlePlayerMovement(scene) {
    // Получаем игрока из Registry
    const player = scene.registry.get('gameCharacter');
    
    // Проверяем, что игрок существует
    if (!player) {
        console.error('Игрок не найден в Registry!');
        return;
    }
    
    // Если у персонажа есть свой метод update, используем его
    if (typeof player.update === 'function') {
        player.update();
    } else {
        // Запасной вариант - базовая логика движения
        // Получаем скорость игрока из конфигурации уровня или используем значение по умолчанию
        let playerSpeed = scene.levelConfig ? scene.levelConfig.playerSpeed : 450;
        
        // Получаем базовую скорость из конфига персонажа, если есть
        const configManager = scene.registry.get('configManager');
        if (configManager) {
            const baseStats = configManager.getConfig('characters/base_stat');
            const characterType = player.getCharacterId ? player.getCharacterId() : 'friender';
            
            if (baseStats && baseStats[characterType]) {
                // Преобразуем относительную скорость (100 = 100%) в абсолютную
                playerSpeed = playerSpeed * (baseStats[characterType].speed / 100);
            }
        }
        
        // Применяем бонус скорости, если он есть у персонажа
        if (player.speedBonus) {
            playerSpeed *= player.speedBonus;
        }
        
        // Получаем курсоры из Registry или создаем их
        let cursors = scene.registry.get('cursors');
        if (!cursors) {
            cursors = scene.input.keyboard.createCursorKeys();
            scene.registry.set('cursors', cursors);
        }
        
        // Обрабатываем движение
        if (cursors.left.isDown) {
            player.setVelocityX(-playerSpeed);
            player.setAngle(-15);
        } else if (cursors.right.isDown) {
            player.setVelocityX(playerSpeed);
            player.setAngle(15);
        } else {
            player.setVelocityX(0);
            player.setAngle(0);
        }
    }
}

// Функция создания новых объектов
function handleItemSpawning(scene, time) {
    // Получаем время спавна из Registry или устанавливаем начальное значение
    let itemSpawnTime = scene.registry.get('itemSpawnTime');
    if (itemSpawnTime === undefined) {
        itemSpawnTime = 0;
        scene.registry.set('itemSpawnTime', itemSpawnTime);
    }
    
    if (time > itemSpawnTime) {
        // Если есть конфигурация уровня, используем её для спавна предметов
        if (scene.levelConfig) {
            spawnLevelItems(scene, scene.levelConfig);
        }
        
        // Устанавливаем время следующего спавна в зависимости от конфигурации уровня
        const minSpawnTime = scene.levelConfig ? scene.levelConfig.spawnRate.min : 500;
        const maxSpawnTime = scene.levelConfig ? scene.levelConfig.spawnRate.max : 1500;
        
        // Обновляем время спавна в Registry
        scene.registry.set('itemSpawnTime', time + Phaser.Math.Between(minSpawnTime, maxSpawnTime));
    }
}

// Функция обновления объектов
function updateGameObjects(scene) {
    // Обновление персонажа уже происходит в handlePlayerMovement
    
    // Получаем группы предметов из Registry
    const goodItems = scene.registry.get('goodItems');
    const badItems = scene.registry.get('badItems');
    const veryGoodItems = scene.registry.get('veryGoodItems');
    
    // Обновление всех типов предметов
    [goodItems, badItems, veryGoodItems].forEach(group => {
        if (group && group.getChildren) {
            group.getChildren().forEach(item => {
                if (item.update) item.update();
            });
        }
    });
    
    // Получаем группу взрывов из Registry
    const explosions = scene.registry.get('explosions');
    
    // Обновление взрывов
    if (explosions && explosions.getChildren) {
        explosions.getChildren().forEach(explosion => {
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
    [goodItems, badItems, veryGoodItems].forEach(group => {
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

// Проверка условий завершения уровня
function checkLevelCompletion(scene, time) {
    // Проверяем условия завершения уровня
    if (scene.levelConfig && scene.checkLevelCompletion(scene.levelId, scene.levelConfig)) {
        scene.levelCompleted = true;
        
        // Показываем текст о завершении уровня
        scene.levelCompletedText.setVisible(true);
        scene.nextLevelText.setVisible(true);
        
        // Ставим игру на паузу
        scene.isPaused = true;
        scene.physics.pause();
    }
    
    // Проверяем достижения
    if (scene.checkAchievements) {
        scene.checkAchievements(scene.levelStartTime, time);
    }
}